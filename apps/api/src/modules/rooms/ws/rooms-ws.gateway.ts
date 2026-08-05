import {
	ConnectedSocket,
	MessageBody,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import type { Server } from 'socket.io';
import {
	ROOM_SOCKET_EVENTS,
	type RoomConnectPayload,
	RoomConnectPayloadSchema,
} from '@rooms/contracts/room';
import type { RoomsSocketData, RoomsSocketWithAuth } from './rooms-ws.types';
import { RoomParticipantWithUser } from '../participants/room-participants.select';
import { RoomParticipantsService } from '../participants/room-participants.service';
import { ApiWsHandler } from 'src/realtime/ws/api-ws-handler.decorator';
import { requireWsUser } from 'src/realtime/ws/require-ws-user';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';
import {
	toRoomParticipantJoinedPayload,
	toRoomPresencePayload,
} from '../rooms.mapper';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];

@ApiWsHandler()
@WebSocketGateway({
	namespace: '/rooms',
	cors: {
		origin: allowedOrigins,
		credentials: true,
	},
})
export class RoomsWsGateway implements OnGatewayDisconnect {
	@WebSocketServer()
	server!: Server;

	constructor(private readonly participantsService: RoomParticipantsService) {}

	/**
	 * A participant may hold the room open from several tabs or devices at once,
	 * so presence tracks their live sockets rather than a single flag: they go
	 * offline when the last one goes away.
	 */
	private roomParticipants = new Map<string, Map<string, Set<string>>>();
	private socketContexts = new Map<string, RoomsSocketData>();

	handleDisconnect(client: RoomsSocketWithAuth) {
		const context = this.socketContexts.get(client.id);
		if (!context) {
			return;
		}

		this.removeParticipantSocket(
			context.roomId,
			context.participantId,
			client.id,
		);
		this.clearSocketContextIfSessionMatches(
			client.id,
			context.sessionVersion,
		);

		this.broadcastPresence(
			context.roomId,
			context.participantId,
			ROOM_SOCKET_EVENTS.DISCONNECT,
		);
	}

	@SubscribeMessage(ROOM_SOCKET_EVENTS.CONNECT)
	async connectToRoom(
		@ConnectedSocket() client: RoomsSocketWithAuth,
		@MessageBody(new ZodValidationPipe(RoomConnectPayloadSchema))
		body: RoomConnectPayload,
	) {
		const userId = requireWsUser(client).sub;

		const participant =
			await this.participantsService.isUserParticipantInRoom(
				body.roomId,
				body.participantId,
				userId,
			);
		if (!participant) {
			return { ok: false, error: 'Participant not found in the room' };
		}

		// A socket that connects again without disconnecting first would
		// otherwise stay counted in whichever room it was in before.
		await this.detachSocket(client);

		const sessionVersion = this.getNextSessionVersion(client.id);
		const context: RoomsSocketData = {
			participantId: body.participantId,
			roomId: body.roomId,
			sessionVersion,
		};
		this.socketContexts.set(client.id, context);

		this.addParticipantSocket(body.roomId, body.participantId, client.id);
		await client.join(body.roomId);

		this.broadcastPresence(
			body.roomId,
			body.participantId,
			ROOM_SOCKET_EVENTS.CONNECT,
		);

		return { ok: true };
	}

	@SubscribeMessage(ROOM_SOCKET_EVENTS.DISCONNECT)
	async disconnectFromRoom(@ConnectedSocket() client: RoomsSocketWithAuth) {
		const context = await this.detachSocket(client);
		if (!context) {
			return { ok: true };
		}

		this.clearSocketContextIfSessionMatches(
			client.id,
			context.sessionVersion,
		);

		this.broadcastPresence(
			context.roomId,
			context.participantId,
			ROOM_SOCKET_EVENTS.DISCONNECT,
		);

		return { ok: true };
	}

	public notifyParticipantJoined(
		roomId: string,
		participant: RoomParticipantWithUser,
	) {
		const payload = toRoomParticipantJoinedPayload(
			participant,
			this.getOnlineParticipantIds(roomId),
		);
		this.server
			.to(roomId)
			.emit(ROOM_SOCKET_EVENTS.PARTICIPANT_JOINED, payload);
	}

	public notifyParticipantLeft(
		roomId: string,
		participant: RoomParticipantWithUser,
	) {
		// Leaving over HTTP does not close the sockets, so presence has to be
		// dropped here or the participant lingers online in the room they left.
		this.evictParticipant(roomId, participant.id);

		const payload = toRoomPresencePayload(
			participant.id,
			this.getOnlineParticipantIds(roomId),
		);
		this.server.to(roomId).emit(ROOM_SOCKET_EVENTS.PARTICIPANT_LEFT, payload);
	}

	public getOnlineParticipantIds(roomId: string): string[] {
		return Array.from(this.roomParticipants.get(roomId)?.keys() ?? []);
	}

	/** Removes every socket a participant holds in a room, online or not. */
	private evictParticipant(roomId: string, participantId: string) {
		const socketIds = this.roomParticipants.get(roomId)?.get(participantId);
		if (!socketIds) {
			return;
		}

		for (const socketId of socketIds) {
			this.socketContexts.delete(socketId);
			this.server.in(socketId).socketsLeave(roomId);
		}

		this.dropParticipant(roomId, participantId);
	}

	private async detachSocket(
		client: RoomsSocketWithAuth,
	): Promise<RoomsSocketData | null> {
		const context = this.socketContexts.get(client.id);
		if (!context) {
			return null;
		}

		this.removeParticipantSocket(
			context.roomId,
			context.participantId,
			client.id,
		);
		await client.leave(context.roomId);

		return context;
	}

	private broadcastPresence(
		roomId: string,
		participantId: string,
		event:
			| typeof ROOM_SOCKET_EVENTS.CONNECT
			| typeof ROOM_SOCKET_EVENTS.DISCONNECT,
	) {
		const payload = toRoomPresencePayload(
			participantId,
			this.getOnlineParticipantIds(roomId),
		);

		this.server.to(roomId).emit(event, payload);
	}

	private addParticipantSocket(
		roomId: string,
		participantId: string,
		socketId: string,
	) {
		let room = this.roomParticipants.get(roomId);
		if (!room) {
			room = new Map();
			this.roomParticipants.set(roomId, room);
		}

		const socketIds = room.get(participantId);
		if (socketIds) {
			socketIds.add(socketId);
			return;
		}

		room.set(participantId, new Set([socketId]));
	}

	private removeParticipantSocket(
		roomId: string,
		participantId: string,
		socketId: string,
	) {
		const socketIds = this.roomParticipants.get(roomId)?.get(participantId);
		if (!socketIds) {
			return;
		}

		socketIds.delete(socketId);
		if (socketIds.size === 0) {
			this.dropParticipant(roomId, participantId);
		}
	}

	private dropParticipant(roomId: string, participantId: string) {
		const room = this.roomParticipants.get(roomId);
		if (!room) {
			return;
		}

		room.delete(participantId);
		if (room.size === 0) {
			this.roomParticipants.delete(roomId);
		}
	}

	private getNextSessionVersion(clientId: string): number {
		return (this.socketContexts.get(clientId)?.sessionVersion ?? 0) + 1;
	}

	private clearSocketContextIfSessionMatches(
		clientId: string,
		sessionVersion: number,
	) {
		const currentContext = this.socketContexts.get(clientId);
		if (currentContext?.sessionVersion === sessionVersion) {
			this.socketContexts.delete(clientId);
		}
	}
}
