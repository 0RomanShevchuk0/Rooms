import { RoomPresenceService } from './room-presence.service';

const ROOM = 'room-1';
const OTHER_ROOM = 'room-2';
const ALICE = 'participant-alice';
const BOB = 'participant-bob';

describe('RoomPresenceService', () => {
	let presence: RoomPresenceService;

	beforeEach(() => {
		presence = new RoomPresenceService();
	});

	it('reports nobody in a room it has never seen', () => {
		expect(presence.getOnlineParticipantIds(ROOM)).toEqual([]);
	});

	it('marks a participant online once a socket attaches', () => {
		presence.attach('s1', ROOM, ALICE);

		expect(presence.getOnlineParticipantIds(ROOM)).toEqual([ALICE]);
	});

	it('takes them offline once that socket detaches', () => {
		presence.attach('s1', ROOM, ALICE);
		presence.detach('s1');

		expect(presence.getOnlineParticipantIds(ROOM)).toEqual([]);
	});

	it('keeps participants of different rooms apart', () => {
		presence.attach('s1', ROOM, ALICE);
		presence.attach('s2', OTHER_ROOM, BOB);

		expect(presence.getOnlineParticipantIds(ROOM)).toEqual([ALICE]);
		expect(presence.getOnlineParticipantIds(OTHER_ROOM)).toEqual([BOB]);
	});

	// Closing one of two tabs used to drop the participant outright.
	describe('with the same participant on several sockets', () => {
		beforeEach(() => {
			presence.attach('s1', ROOM, ALICE);
			presence.attach('s2', ROOM, ALICE);
		});

		it('reports them online only once', () => {
			expect(presence.getOnlineParticipantIds(ROOM)).toEqual([ALICE]);
		});

		it('keeps them online while any socket remains', () => {
			presence.detach('s1');

			expect(presence.getOnlineParticipantIds(ROOM)).toEqual([ALICE]);
		});

		it('takes them offline when the last socket goes', () => {
			presence.detach('s1');
			presence.detach('s2');

			expect(presence.getOnlineParticipantIds(ROOM)).toEqual([]);
		});

		it('ignores a repeated detach of the same socket', () => {
			presence.detach('s1');
			presence.detach('s1');

			expect(presence.getOnlineParticipantIds(ROOM)).toEqual([ALICE]);
		});
	});

	describe('detach', () => {
		it('returns the room the socket was in', () => {
			presence.attach('s1', ROOM, ALICE);

			expect(presence.detach('s1')).toMatchObject({
				roomId: ROOM,
				participantId: ALICE,
			});
		});

		it('returns nothing for a socket it never saw', () => {
			expect(presence.detach('stranger')).toBeNull();
		});
	});

	// A reconnecting socket used to stay counted in the room it came from.
	it('stops counting a socket in the room it attached to before', () => {
		presence.attach('s1', ROOM, ALICE);
		presence.detach('s1');
		presence.attach('s1', OTHER_ROOM, ALICE);

		expect(presence.getOnlineParticipantIds(ROOM)).toEqual([]);
		expect(presence.getOnlineParticipantIds(OTHER_ROOM)).toEqual([ALICE]);
	});

	describe('releaseContext', () => {
		it('leaves a newer context alone', () => {
			const stale = presence.attach('s1', ROOM, ALICE);
			presence.detach('s1');
			presence.attach('s1', OTHER_ROOM, ALICE);

			presence.releaseContext('s1', stale.sessionVersion);

			expect(presence.detach('s1')).toMatchObject({ roomId: OTHER_ROOM });
		});

		it('clears the context it was given', () => {
			const context = presence.attach('s1', ROOM, ALICE);
			presence.detach('s1');

			presence.releaseContext('s1', context.sessionVersion);

			expect(presence.detach('s1')).toBeNull();
		});
	});

	// Leaving over HTTP leaves the sockets open.
	describe('evict', () => {
		it('drops the participant outright', () => {
			presence.attach('s1', ROOM, ALICE);
			presence.evict(ROOM, ALICE);

			expect(presence.getOnlineParticipantIds(ROOM)).toEqual([]);
		});

		it('reports every socket they held so the caller can release them', () => {
			presence.attach('s1', ROOM, ALICE);
			presence.attach('s2', ROOM, ALICE);

			expect(presence.evict(ROOM, ALICE).sort()).toEqual(['s1', 's2']);
		});

		it('leaves everyone else in the room alone', () => {
			presence.attach('s1', ROOM, ALICE);
			presence.attach('s2', ROOM, BOB);
			presence.evict(ROOM, ALICE);

			expect(presence.getOnlineParticipantIds(ROOM)).toEqual([BOB]);
		});

		it('does not bring them back when the stale socket finally closes', () => {
			presence.attach('s1', ROOM, ALICE);
			presence.evict(ROOM, ALICE);
			presence.detach('s1');

			expect(presence.getOnlineParticipantIds(ROOM)).toEqual([]);
		});

		it('reports nothing for a participant who was not there', () => {
			expect(presence.evict(ROOM, ALICE)).toEqual([]);
		});
	});
});
