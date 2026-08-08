import type { Server } from 'socket.io';
import { ROOM_SOCKET_EVENTS } from '@rooms/contracts/room';
import type { RoomParticipantsService } from '../participants/room-participants.service';
import type { RoomParticipantWithUser } from '../participants/room-participants.select';
import { RoomPresenceService } from '../presence/room-presence.service';
import { RoomLobbyService } from '../lobby/room-lobby.service';
import { RoomsWsGateway } from './rooms-ws.gateway';
import type { RoomsSocketWithAuth } from './rooms-ws.types';

const ROOM = 'room-1';
const OTHER_ROOM = 'room-2';
const ALICE = 'participant-alice';
const BOB = 'participant-bob';

interface Emitted {
	room: string;
	event: string;
	payload: {
		participantId?: string;
		onlineParticipantIds?: string[];
		phase?: string;
		readyParticipantIds?: string[];
		windowSecondsLeft?: number | null;
	};
}

/** Bookkeeping is covered in RoomPresenceService; these cases are the wire. */
function createGateway({ isParticipant = true } = {}) {
	const emitted: Emitted[] = [];
	const socketsLeft: { socketId: string; room: string }[] = [];

	const server = {
		to: (room: string) => ({
			emit: (event: string, payload: Emitted['payload']) => {
				emitted.push({ room, event, payload });
			},
		}),
		in: (socketId: string) => ({
			socketsLeave: (room: string) => {
				socketsLeft.push({ socketId, room });
			},
		}),
	} as unknown as Server;

	const participantsService = {
		isUserParticipantInRoom: () => Promise.resolve(isParticipant),
	} as unknown as RoomParticipantsService;

	const presence = new RoomPresenceService();
	const lobby = new RoomLobbyService();
	const gateway = new RoomsWsGateway(participantsService, presence, lobby);
	gateway.server = server;
	gateway.onModuleInit();

	return { gateway, presence, lobby, emitted, socketsLeft };
}

function createSocket(id: string, sink: Emitted[] = []) {
	return {
		id,
		join: () => Promise.resolve(),
		leave: () => Promise.resolve(),
		emit: (event: string, payload: Emitted['payload']) => {
			sink.push({ room: id, event, payload });
		},
		data: { user: { sub: 'user-1' } },
	} as unknown as RoomsSocketWithAuth;
}

function lastPayload(emitted: Emitted[]) {
	return emitted[emitted.length - 1].payload;
}

describe('RoomsWsGateway', () => {
	// A gathering window left open would outlive the test that opened it.
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('announces a connection with the current online list', async () => {
		const { gateway, emitted } = createGateway();

		await gateway.connectToRoom(createSocket('s1'), {
			roomId: ROOM,
			participantId: ALICE,
		});

		expect(emitted).toEqual([
			{
				room: ROOM,
				event: ROOM_SOCKET_EVENTS.CONNECT,
				payload: {
					participantId: ALICE,
					onlineParticipantIds: [ALICE],
				},
			},
		]);
	});

	it('announces a departure with whoever is left', async () => {
		const { gateway, emitted } = createGateway();
		const socket = createSocket('s1');

		await gateway.connectToRoom(socket, {
			roomId: ROOM,
			participantId: ALICE,
		});
		await gateway.connectToRoom(createSocket('s2'), {
			roomId: ROOM,
			participantId: BOB,
		});
		gateway.handleDisconnect(socket);

		expect(lastPayload(emitted)).toEqual({
			participantId: ALICE,
			onlineParticipantIds: [BOB],
		});
	});

	it('refuses a socket whose user is not in the room', async () => {
		const { gateway, emitted } = createGateway({ isParticipant: false });

		const result = await gateway.connectToRoom(createSocket('s1'), {
			roomId: ROOM,
			participantId: ALICE,
		});

		expect(result).toEqual({
			ok: false,
			error: 'Participant not found in the room',
		});
		expect(emitted).toHaveLength(0);
	});

	// Reconnecting without disconnecting first has to release the previous room.
	it('takes a reconnecting socket out of the room it came from', async () => {
		const { gateway, presence } = createGateway();
		const socket = createSocket('s1');

		await gateway.connectToRoom(socket, {
			roomId: ROOM,
			participantId: ALICE,
		});
		await gateway.connectToRoom(socket, {
			roomId: OTHER_ROOM,
			participantId: ALICE,
		});

		expect(presence.getOnlineParticipantIds(ROOM)).toEqual([]);
		expect(presence.getOnlineParticipantIds(OTHER_ROOM)).toEqual([ALICE]);
	});

	it('says nothing when a socket that never joined disconnects', () => {
		const { gateway, emitted } = createGateway();

		gateway.handleDisconnect(createSocket('stranger'));

		expect(emitted).toHaveLength(0);
	});

	it('still announces a leave while the participant has other tabs open', async () => {
		const { gateway, emitted } = createGateway();
		const firstTab = createSocket('s1');

		await gateway.connectToRoom(firstTab, {
			roomId: ROOM,
			participantId: ALICE,
		});
		await gateway.connectToRoom(createSocket('s2'), {
			roomId: ROOM,
			participantId: ALICE,
		});
		gateway.handleDisconnect(firstTab);

		// Clients render this list, and the other tab keeps them on it.
		expect(lastPayload(emitted).onlineParticipantIds).toEqual([ALICE]);
	});

	describe('lobby', () => {
		it('hands the current lobby state to a socket that just connected', async () => {
			const { gateway } = createGateway();
			const ownEmits: Emitted[] = [];

			await gateway.connectToRoom(createSocket('s1', ownEmits), {
				roomId: ROOM,
				participantId: ALICE,
			});

			expect(ownEmits).toEqual([
				{
					room: 's1',
					event: ROOM_SOCKET_EVENTS.LOBBY_STATE,
					payload: {
						phase: 'lobby',
						readyParticipantIds: [],
						windowSecondsLeft: null,
					},
				},
			]);
		});

		it('broadcasts the open window when someone readies up', async () => {
			const { gateway, emitted } = createGateway();
			const socket = createSocket('s1');

			await gateway.connectToRoom(socket, {
				roomId: ROOM,
				participantId: ALICE,
			});
			await gateway.connectToRoom(createSocket('s2'), {
				roomId: ROOM,
				participantId: BOB,
			});
			gateway.setReady(socket, { roomId: ROOM, isReady: true });

			expect(emitted[emitted.length - 1]).toEqual({
				room: ROOM,
				event: ROOM_SOCKET_EVENTS.LOBBY_STATE,
				payload: {
					phase: 'gathering',
					readyParticipantIds: [ALICE],
					windowSecondsLeft: 15,
				},
			});
		});

		// The socket says who it is; the payload only says which room.
		it('refuses ready from a socket that never joined the room', () => {
			const { gateway, lobby } = createGateway();

			const result = gateway.setReady(createSocket('stranger'), {
				roomId: ROOM,
				isReady: true,
			});

			expect(result).toEqual({
				ok: false,
				error: 'Not connected to the room',
			});
			expect(lobby.getState(ROOM).phase).toBe('lobby');
		});

		it('gives up their spot in the next match when the socket drops', async () => {
			const { gateway, lobby, emitted } = createGateway();
			const socket = createSocket('s1');

			await gateway.connectToRoom(socket, {
				roomId: ROOM,
				participantId: ALICE,
			});
			await gateway.connectToRoom(createSocket('s2'), {
				roomId: ROOM,
				participantId: BOB,
			});
			gateway.setReady(socket, { roomId: ROOM, isReady: true });
			gateway.handleDisconnect(socket);

			expect(lobby.getState(ROOM).readyParticipantIds).toEqual([]);
			expect(emitted.map((entry) => entry.event)).toContain(
				ROOM_SOCKET_EVENTS.LOBBY_STATE,
			);
		});
	});

	describe('notifyParticipantLeft', () => {
		const participant = { id: ALICE } as RoomParticipantWithUser;

		it('leaves them out of the broadcast announcing the departure', async () => {
			const { gateway, emitted } = createGateway();

			await gateway.connectToRoom(createSocket('s1'), {
				roomId: ROOM,
				participantId: ALICE,
			});
			await gateway.connectToRoom(createSocket('s2'), {
				roomId: ROOM,
				participantId: BOB,
			});
			gateway.notifyParticipantLeft(ROOM, participant);

			expect(lastPayload(emitted)).toEqual({
				participantId: ALICE,
				onlineParticipantIds: [BOB],
			});
		});

		// Their sockets survive an HTTP leave and would keep receiving events.
		it('pulls every socket they held out of the room', async () => {
			const { gateway, socketsLeft } = createGateway();

			await gateway.connectToRoom(createSocket('s1'), {
				roomId: ROOM,
				participantId: ALICE,
			});
			await gateway.connectToRoom(createSocket('s2'), {
				roomId: ROOM,
				participantId: ALICE,
			});
			gateway.notifyParticipantLeft(ROOM, participant);

			expect(socketsLeft).toEqual([
				{ socketId: 's1', room: ROOM },
				{ socketId: 's2', room: ROOM },
			]);
		});
	});
});
