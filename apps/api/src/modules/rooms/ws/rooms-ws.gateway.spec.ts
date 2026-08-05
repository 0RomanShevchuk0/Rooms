import type { Server } from 'socket.io';
import { ROOM_SOCKET_EVENTS } from '@rooms/contracts/room';
import type { RoomParticipantsService } from '../participants/room-participants.service';
import type { RoomParticipantWithUser } from '../participants/room-participants.select';
import { RoomsWsGateway } from './rooms-ws.gateway';
import type { RoomsSocketWithAuth } from './rooms-ws.types';

const ROOM = 'room-1';
const OTHER_ROOM = 'room-2';
const ALICE = 'participant-alice';
const BOB = 'participant-bob';

interface Emitted {
	room: string;
	event: string;
	payload: { participantId: string; onlineParticipantIds: string[] };
}

function createGateway() {
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
		isUserParticipantInRoom: () => Promise.resolve({ id: 'ok' }),
	} as unknown as RoomParticipantsService;

	const gateway = new RoomsWsGateway(participantsService);
	gateway.server = server;

	return { gateway, emitted, socketsLeft };
}

function createSocket(id: string) {
	return {
		id,
		join: () => Promise.resolve(),
		leave: () => Promise.resolve(),
		data: { user: { sub: 'user-1' } },
	} as unknown as RoomsSocketWithAuth;
}

function lastPayload(emitted: Emitted[]) {
	return emitted[emitted.length - 1].payload;
}

describe('RoomsWsGateway presence', () => {
	it('marks a participant online while their socket is connected', async () => {
		const { gateway, emitted } = createGateway();

		await gateway.connectToRoom(createSocket('s1'), {
			roomId: ROOM,
			participantId: ALICE,
		});

		expect(gateway.getOnlineParticipantIds(ROOM)).toEqual([ALICE]);
		expect(emitted).toHaveLength(1);
		expect(emitted[0].event).toBe(ROOM_SOCKET_EVENTS.CONNECT);
		expect(lastPayload(emitted).onlineParticipantIds).toEqual([ALICE]);
	});

	it('takes them offline once that socket goes away', async () => {
		const { gateway } = createGateway();
		const socket = createSocket('s1');

		await gateway.connectToRoom(socket, {
			roomId: ROOM,
			participantId: ALICE,
		});
		gateway.handleDisconnect(socket);

		expect(gateway.getOnlineParticipantIds(ROOM)).toEqual([]);
	});

	// Closing one of two tabs used to remove the participant outright, so a
	// person still sitting in the room dropped off everyone else's list.
	describe('with the same participant on several sockets', () => {
		it('keeps them online while any socket remains', async () => {
			const { gateway } = createGateway();
			const firstTab = createSocket('s1');
			const secondTab = createSocket('s2');

			await gateway.connectToRoom(firstTab, {
				roomId: ROOM,
				participantId: ALICE,
			});
			await gateway.connectToRoom(secondTab, {
				roomId: ROOM,
				participantId: ALICE,
			});
			gateway.handleDisconnect(firstTab);

			expect(gateway.getOnlineParticipantIds(ROOM)).toEqual([ALICE]);
		});

		it('reports them online only once', async () => {
			const { gateway } = createGateway();

			await gateway.connectToRoom(createSocket('s1'), {
				roomId: ROOM,
				participantId: ALICE,
			});
			await gateway.connectToRoom(createSocket('s2'), {
				roomId: ROOM,
				participantId: ALICE,
			});

			expect(gateway.getOnlineParticipantIds(ROOM)).toEqual([ALICE]);
		});

		it('takes them offline when the last socket closes', async () => {
			const { gateway } = createGateway();
			const firstTab = createSocket('s1');
			const secondTab = createSocket('s2');

			await gateway.connectToRoom(firstTab, {
				roomId: ROOM,
				participantId: ALICE,
			});
			await gateway.connectToRoom(secondTab, {
				roomId: ROOM,
				participantId: ALICE,
			});
			gateway.handleDisconnect(firstTab);
			gateway.handleDisconnect(secondTab);

			expect(gateway.getOnlineParticipantIds(ROOM)).toEqual([]);
		});

		it('survives an explicit leave followed by the socket closing', async () => {
			const { gateway } = createGateway();
			const firstTab = createSocket('s1');
			const secondTab = createSocket('s2');

			await gateway.connectToRoom(firstTab, {
				roomId: ROOM,
				participantId: ALICE,
			});
			await gateway.connectToRoom(secondTab, {
				roomId: ROOM,
				participantId: ALICE,
			});
			await gateway.disconnectFromRoom(firstTab);
			gateway.handleDisconnect(firstTab);

			expect(gateway.getOnlineParticipantIds(ROOM)).toEqual([ALICE]);
		});
	});

	// Without cleanup the socket stayed counted in the room it came from, which
	// left somebody online in a room nobody was watching.
	it('stops counting a socket in the room it connected to before', async () => {
		const { gateway } = createGateway();
		const socket = createSocket('s1');

		await gateway.connectToRoom(socket, {
			roomId: ROOM,
			participantId: ALICE,
		});
		await gateway.connectToRoom(socket, {
			roomId: OTHER_ROOM,
			participantId: ALICE,
		});

		expect(gateway.getOnlineParticipantIds(ROOM)).toEqual([]);
		expect(gateway.getOnlineParticipantIds(OTHER_ROOM)).toEqual([ALICE]);
	});

	it('keeps participants of different rooms apart', async () => {
		const { gateway } = createGateway();

		await gateway.connectToRoom(createSocket('s1'), {
			roomId: ROOM,
			participantId: ALICE,
		});
		await gateway.connectToRoom(createSocket('s2'), {
			roomId: OTHER_ROOM,
			participantId: BOB,
		});

		expect(gateway.getOnlineParticipantIds(ROOM)).toEqual([ALICE]);
		expect(gateway.getOnlineParticipantIds(OTHER_ROOM)).toEqual([BOB]);
	});

	it('ignores a socket that never connected to a room', () => {
		const { gateway, emitted } = createGateway();

		gateway.handleDisconnect(createSocket('stranger'));

		expect(emitted).toHaveLength(0);
	});
});

describe('RoomsWsGateway.notifyParticipantLeft', () => {
	const participant = { id: ALICE } as RoomParticipantWithUser;

	// Leaving over HTTP leaves the socket open, so presence had to be dropped
	// explicitly or the participant stayed online in a room they had left.
	it('drops presence for someone who left over HTTP', async () => {
		const { gateway } = createGateway();

		await gateway.connectToRoom(createSocket('s1'), {
			roomId: ROOM,
			participantId: ALICE,
		});
		gateway.notifyParticipantLeft(ROOM, participant);

		expect(gateway.getOnlineParticipantIds(ROOM)).toEqual([]);
	});

	it('leaves them out of the broadcast that announces the departure', async () => {
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

	it('drops every tab they had open, not just one', async () => {
		const { gateway } = createGateway();

		await gateway.connectToRoom(createSocket('s1'), {
			roomId: ROOM,
			participantId: ALICE,
		});
		await gateway.connectToRoom(createSocket('s2'), {
			roomId: ROOM,
			participantId: ALICE,
		});
		gateway.notifyParticipantLeft(ROOM, participant);

		expect(gateway.getOnlineParticipantIds(ROOM)).toEqual([]);
	});

	it('pulls their sockets out of the room so they stop receiving its events', async () => {
		const { gateway, socketsLeft } = createGateway();

		await gateway.connectToRoom(createSocket('s1'), {
			roomId: ROOM,
			participantId: ALICE,
		});
		gateway.notifyParticipantLeft(ROOM, participant);

		expect(socketsLeft).toEqual([{ socketId: 's1', room: ROOM }]);
	});

	it('does not resurrect presence when the stale socket finally closes', async () => {
		const { gateway } = createGateway();
		const socket = createSocket('s1');

		await gateway.connectToRoom(socket, {
			roomId: ROOM,
			participantId: ALICE,
		});
		gateway.notifyParticipantLeft(ROOM, participant);
		gateway.handleDisconnect(socket);

		expect(gateway.getOnlineParticipantIds(ROOM)).toEqual([]);
	});
});
