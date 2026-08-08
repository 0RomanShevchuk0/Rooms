import {
	ConnectedSocket,
	MessageBody,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import type { OnModuleInit } from '@nestjs/common';
import type { Server } from 'socket.io';
import {
	ROOM_SOCKET_EVENTS,
	type RoomConnectPayload,
	RoomConnectPayloadSchema,
	type RoomSetReadyPayload,
	RoomSetReadyPayloadSchema,
	type RoomStartNowPayload,
	RoomStartNowPayloadSchema,
} from '@rooms/contracts/room';
import type { RoomsSocketWithAuth } from './rooms-ws.types';
import { RoomParticipantWithUser } from '../participants/room-participants.select';
import { RoomParticipantsService } from '../participants/room-participants.service';
import { RoomPresenceService } from '../presence/room-presence.service';
import {
	RoomLobbyService,
	type RoomLobbyState,
} from '../lobby/room-lobby.service';
import { ApiWsHandler } from 'src/realtime/ws/api-ws-handler.decorator';
import { requireWsUser } from 'src/realtime/ws/require-ws-user';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';
import {
	toRoomLobbyStatePayload,
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
export class RoomsWsGateway implements OnGatewayDisconnect, OnModuleInit {
	@WebSocketServer()
	server!: Server;

	constructor(
		private readonly participantsService: RoomParticipantsService,
		private readonly presence: RoomPresenceService,
		private readonly lobby: RoomLobbyService,
	) {}

	onModuleInit() {
		this.lobby.on('stateChanged', (roomId, state) => {
			this.broadcastLobbyState(roomId, state);
		});
	}

	handleDisconnect(client: RoomsSocketWithAuth) {
		const context = this.presence.detach(client.id);
		if (!context) {
			return;
		}

		this.presence.releaseContext(client.id, context.sessionVersion);
		// Their spot in the next match goes with their last socket.
		this.lobby.clearReady(context.roomId, context.participantId);

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

		// A latecomer needs the current phase now, not at the next state change.
		client.emit(
			ROOM_SOCKET_EVENTS.LOBBY_STATE,
			toRoomLobbyStatePayload(this.lobby.getState(body.roomId)),
		);

		return { ok: true };
	}

	@SubscribeMessage(ROOM_SOCKET_EVENTS.SET_READY)
	setReady(
		@ConnectedSocket() client: RoomsSocketWithAuth,
		@MessageBody(new ZodValidationPipe(RoomSetReadyPayloadSchema))
		body: RoomSetReadyPayload,
	) {
		const context = this.requireRoomContext(client, body.roomId);
		if (!context) {
			return { ok: false, error: 'Not connected to the room' };
		}

		this.lobby.setReady(
			context.roomId,
			context.participantId,
			body.isReady,
			this.presence.getOnlineParticipantIds(context.roomId),
		);

		return { ok: true };
	}

	@SubscribeMessage(ROOM_SOCKET_EVENTS.START_NOW)
	startNow(
		@ConnectedSocket() client: RoomsSocketWithAuth,
		@MessageBody(new ZodValidationPipe(RoomStartNowPayloadSchema))
		body: RoomStartNowPayload,
	) {
		const context = this.requireRoomContext(client, body.roomId);
		if (!context) {
			return { ok: false, error: 'Not connected to the room' };
		}

		this.lobby.startNow(context.roomId, context.participantId);

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

	/** The socket's own presence context, never the room id it claims. */
	private requireRoomContext(client: RoomsSocketWithAuth, roomId: string) {
		const context = this.presence.getContext(client.id);
		if (!context || context.roomId !== roomId) {
			return null;
		}

		return context;
	}

	private broadcastLobbyState(roomId: string, state: RoomLobbyState) {
		this.server
			.to(roomId)
			.emit(ROOM_SOCKET_EVENTS.LOBBY_STATE, toRoomLobbyStatePayload(state));
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
