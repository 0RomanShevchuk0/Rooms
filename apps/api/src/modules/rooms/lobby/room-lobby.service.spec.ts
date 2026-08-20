import {
	GATHERING_TICK_MS,
	GATHERING_WINDOW_SECONDS,
	ROOM_PHASE,
	RoomLobbyService,
} from './room-lobby.service';

const WINDOW_MS = GATHERING_WINDOW_SECONDS * GATHERING_TICK_MS;

const ROOM = 'room-1';
const OTHER_ROOM = 'room-2';
const ALICE = 'participant-alice';
const BOB = 'participant-bob';
const CAROL = 'participant-carol';

describe('RoomLobbyService', () => {
	let lobby: RoomLobbyService;
	let startedMatches: { roomId: string; playerIds: string[] }[];

	beforeEach(() => {
		jest.useFakeTimers();
		lobby = new RoomLobbyService();
		startedMatches = [];
		lobby.on('matchStart', (roomId, playerIds) => {
			startedMatches.push({ roomId, playerIds });
		});
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('starts out in the lobby with nobody ready', () => {
		expect(lobby.getState(ROOM)).toEqual({
			phase: ROOM_PHASE.LOBBY,
			readyParticipantIds: [],
			windowSecondsLeft: null,
		});
	});

	describe('when the first participant readies up', () => {
		beforeEach(() => {
			lobby.setReady(ROOM, ALICE, true, [ALICE, BOB]);
		});

		it('opens the gathering window', () => {
			expect(lobby.getState(ROOM)).toMatchObject({
				phase: ROOM_PHASE.GATHERING,
				readyParticipantIds: [ALICE],
			});
		});

		it('starts the countdown at the full window', () => {
			expect(lobby.getState(ROOM).windowSecondsLeft).toBe(
				GATHERING_WINDOW_SECONDS,
			);
		});

		it('counts down a second at a time', () => {
			jest.advanceTimersByTime(3 * GATHERING_TICK_MS);

			expect(lobby.getState(ROOM).windowSecondsLeft).toBe(
				GATHERING_WINDOW_SECONDS - 3,
			);
		});

		it('publishes every second of the countdown', () => {
			const seconds: (number | null)[] = [];
			lobby.on('stateChanged', (_roomId, state) =>
				seconds.push(state.windowSecondsLeft),
			);

			jest.advanceTimersByTime(3 * GATHERING_TICK_MS);

			expect(seconds).toEqual([14, 13, 12]);
		});

		it('waits for the window before starting', () => {
			expect(startedMatches).toEqual([]);
		});

		it('takes in whoever readies up before it closes', () => {
			lobby.setReady(ROOM, BOB, true, [ALICE, BOB, CAROL]);
			jest.advanceTimersByTime(WINDOW_MS);

			expect(startedMatches).toEqual([
				{ roomId: ROOM, playerIds: [ALICE, BOB] },
			]);
		});

		it('leaves out whoever did not', () => {
			jest.advanceTimersByTime(WINDOW_MS);

			expect(startedMatches).toEqual([{ roomId: ROOM, playerIds: [ALICE] }]);
			expect(lobby.getState(ROOM)).toMatchObject({
				phase: ROOM_PHASE.RUNNING,
				windowSecondsLeft: null,
			});
		});
	});

	// Waiting out the window alone would be pure dead time.
	it('starts at once when everyone online is ready', () => {
		lobby.setReady(ROOM, ALICE, true, [ALICE]);

		expect(startedMatches).toEqual([{ roomId: ROOM, playerIds: [ALICE] }]);
	});

	it('starts at once when the last of several readies up', () => {
		lobby.setReady(ROOM, ALICE, true, [ALICE, BOB]);
		lobby.setReady(ROOM, BOB, true, [ALICE, BOB]);

		expect(startedMatches).toEqual([
			{ roomId: ROOM, playerIds: [ALICE, BOB] },
		]);
	});

	describe('un-readying inside the window', () => {
		beforeEach(() => {
			lobby.setReady(ROOM, ALICE, true, [ALICE, BOB]);
			lobby.setReady(ROOM, BOB, true, [ALICE, BOB, CAROL]);
		});

		it('gives up the spot', () => {
			lobby.setReady(ROOM, BOB, false, [ALICE, BOB, CAROL]);
			jest.advanceTimersByTime(WINDOW_MS);

			expect(startedMatches).toEqual([{ roomId: ROOM, playerIds: [ALICE] }]);
		});

		it('cancels the window once the last one leaves', () => {
			lobby.setReady(ROOM, ALICE, false, [ALICE, BOB, CAROL]);
			lobby.setReady(ROOM, BOB, false, [ALICE, BOB, CAROL]);
			jest.advanceTimersByTime(WINDOW_MS);

			expect(lobby.getState(ROOM).phase).toBe(ROOM_PHASE.LOBBY);
			expect(startedMatches).toEqual([]);
		});
	});

	describe('when a ready participant drops off', () => {
		beforeEach(() => {
			lobby.setReady(ROOM, ALICE, true, [ALICE, BOB]);
			lobby.setReady(ROOM, BOB, true, [ALICE, BOB, CAROL]);
		});

		it('gives up their spot', () => {
			lobby.clearReady(ROOM, BOB);
			jest.advanceTimersByTime(WINDOW_MS);

			expect(startedMatches).toEqual([{ roomId: ROOM, playerIds: [ALICE] }]);
		});

		it('cancels the window if they were the last one ready', () => {
			lobby.clearReady(ROOM, ALICE);
			lobby.clearReady(ROOM, BOB);
			jest.advanceTimersByTime(WINDOW_MS);

			expect(lobby.getState(ROOM).phase).toBe(ROOM_PHASE.LOBBY);
			expect(startedMatches).toEqual([]);
		});

		// Someone else closing their tab must not cut the window short.
		it('never starts the match early', () => {
			lobby.clearReady(ROOM, BOB);

			expect(startedMatches).toEqual([]);
			expect(lobby.getState(ROOM).phase).toBe(ROOM_PHASE.GATHERING);
		});
	});

	describe('starting the match by hand', () => {
		beforeEach(() => {
			lobby.setReady(ROOM, ALICE, true, [ALICE, BOB]);
		});

		it('skips the rest of the window for someone already playing', () => {
			lobby.startNow(ROOM, ALICE);

			expect(startedMatches).toEqual([{ roomId: ROOM, playerIds: [ALICE] }]);
		});

		it('ignores anyone who is not', () => {
			lobby.startNow(ROOM, BOB);

			expect(startedMatches).toEqual([]);
			expect(lobby.getState(ROOM).phase).toBe(ROOM_PHASE.GATHERING);
		});

		it('does nothing outside the gathering window', () => {
			lobby.startNow(OTHER_ROOM, ALICE);

			expect(startedMatches).toEqual([]);
		});
	});

	describe('while a match is running', () => {
		beforeEach(() => {
			lobby.setReady(ROOM, ALICE, true, [ALICE]);
		});

		it('ignores ready changes', () => {
			lobby.setReady(ROOM, BOB, true, [ALICE, BOB]);

			expect(lobby.getState(ROOM)).toMatchObject({
				phase: ROOM_PHASE.RUNNING,
				readyParticipantIds: [ALICE],
			});
			expect(startedMatches).toHaveLength(1);
		});

		it('does not start a second match', () => {
			lobby.startNow(ROOM, ALICE);
			jest.advanceTimersByTime(WINDOW_MS);

			expect(startedMatches).toHaveLength(1);
		});

		it('sends everyone back to the lobby when it ends', () => {
			lobby.endMatch(ROOM);

			expect(lobby.getState(ROOM)).toEqual({
				phase: ROOM_PHASE.LOBBY,
				readyParticipantIds: [],
				windowSecondsLeft: null,
			});
		});

		it('needs everyone to sign up again for the next one', () => {
			lobby.endMatch(ROOM);
			lobby.setReady(ROOM, ALICE, true, [ALICE]);

			expect(startedMatches).toEqual([
				{ roomId: ROOM, playerIds: [ALICE] },
				{ roomId: ROOM, playerIds: [ALICE] },
			]);
		});
	});

	it('drops a pending window when the room goes away', () => {
		lobby.setReady(ROOM, ALICE, true, [ALICE, BOB]);
		lobby.dispose(ROOM);
		jest.advanceTimersByTime(WINDOW_MS);

		expect(startedMatches).toEqual([]);
		expect(lobby.getState(ROOM).phase).toBe(ROOM_PHASE.LOBBY);
	});

	it('keeps rooms apart', () => {
		lobby.setReady(ROOM, ALICE, true, [ALICE, BOB]);
		lobby.setReady(OTHER_ROOM, CAROL, true, [CAROL]);

		expect(lobby.getState(ROOM).phase).toBe(ROOM_PHASE.GATHERING);
		expect(startedMatches).toEqual([
			{ roomId: OTHER_ROOM, playerIds: [CAROL] },
		]);
	});

	it('announces every state change', () => {
		const states: string[] = [];
		lobby.on('stateChanged', (_roomId, state) => states.push(state.phase));

		lobby.setReady(ROOM, ALICE, true, [ALICE, BOB]);
		lobby.setReady(ROOM, ALICE, false, [ALICE, BOB]);

		expect(states).toEqual([ROOM_PHASE.GATHERING, ROOM_PHASE.LOBBY]);
	});
});
