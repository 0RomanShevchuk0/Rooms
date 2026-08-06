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
import type { RoomsSocketWithAuth } from './rooms-ws.types';
import { RoomParticipantWithUser } from '../participants/room-participants.select';
import { RoomParticipantsService } from '../participants/room-participants.service';
import { RoomPresenceService } from '../presence/room-presence.service';
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

	constructor(
		private readonly participantsService: RoomParticipantsService,
		private readonly presence: RoomPresenceService,
	) {}

	handleDisconnect(client: RoomsSocketWithAuth) {
		const context = this.presence.detach(client.id);
		if (!context) {
			return;
		}

		this.presence.releaseContext(client.id, context.sessionVersion);

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

		const isParticipant =
			await this.participantsService.isUserParticipantInRoom(
				body.roomId,
				body.participantId,
				userId,
			);
		if (!isParticipant) {
			return { ok: false, error: 'Participant not found in the room' };
		}

		// A socket may connect again without disconnecting first.
		const previousContext = this.presence.detach(client.id);
		if (previousContext) {
			await client.leave(previousContext.roomId);
		}

		this.presence.attach(client.id, body.roomId, body.participantId);
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
		const context = this.presence.detach(client.id);
		if (!context) {
			return { ok: true };
		}

		await client.leave(context.roomId);
		this.presence.releaseContext(client.id, context.sessionVersion);

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
			this.presence.getOnlineParticipantIds(roomId),
		);
		this.server
			.to(roomId)
			.emit(ROOM_SOCKET_EVENTS.PARTICIPANT_JOINED, payload);
	}

	public notifyParticipantLeft(
		roomId: string,
		participant: RoomParticipantWithUser,
	) {
		// Their sockets outlive an HTTP leave and would keep hearing the room.
		const evictedSocketIds = this.presence.evict(roomId, participant.id);
		for (const socketId of evictedSocketIds) {
			this.server.in(socketId).socketsLeave(roomId);
		}

		const payload = toRoomPresencePayload(
			participant.id,
			this.presence.getOnlineParticipantIds(roomId),
		);
		this.server.to(roomId).emit(ROOM_SOCKET_EVENTS.PARTICIPANT_LEFT, payload);
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
			this.presence.getOnlineParticipantIds(roomId),
		);

		this.server.to(roomId).emit(event, payload);
	}
}
