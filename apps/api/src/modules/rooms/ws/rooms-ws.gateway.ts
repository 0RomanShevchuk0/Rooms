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

	private roomParticipants = new Map<string, Set<string>>();
	private socketContexts = new Map<string, RoomsSocketData>();

	handleDisconnect(client: RoomsSocketWithAuth) {
		const context = this.socketContexts.get(client.id);
		if (!context) {
			return;
		}

		this.removeParticipantFromRoom(context.roomId, context.participantId);
		this.clearSocketContextIfSessionMatches(
			client.id,
			context.sessionVersion,
		);

		const payload = toRoomPresencePayload(
			context.participantId,
			this.getOnlineParticipantIds(context.roomId),
		);
		this.server
			.to(context.roomId)
			.emit(ROOM_SOCKET_EVENTS.DISCONNECT, payload);
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

		const sessionVersion = this.getNextSessionVersion(client.id);
		const context: RoomsSocketData = {
			participantId: body.participantId,
			roomId: body.roomId,
			sessionVersion,
		};
		this.socketContexts.set(client.id, context);

		this.addParticipantToRoom(body.roomId, body.participantId);
		await client.join(body.roomId);

		const payload = toRoomPresencePayload(
			body.participantId,
			this.getOnlineParticipantIds(body.roomId),
		);

		this.server.to(body.roomId).emit(ROOM_SOCKET_EVENTS.CONNECT, payload);

		return { ok: true };
	}

	@SubscribeMessage(ROOM_SOCKET_EVENTS.DISCONNECT)
	async disconnectFromRoom(@ConnectedSocket() client: RoomsSocketWithAuth) {
		const context = this.socketContexts.get(client.id);
		if (!context) {
			return { ok: true };
		}

		this.removeParticipantFromRoom(context.roomId, context.participantId);
		await client.leave(context.roomId);
		this.clearSocketContextIfSessionMatches(
			client.id,
			context.sessionVersion,
		);

		const payload = toRoomPresencePayload(
			context.participantId,
			this.getOnlineParticipantIds(context.roomId),
		);

		this.server
			.to(context.roomId)
			.emit(ROOM_SOCKET_EVENTS.DISCONNECT, payload);

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
		const payload = toRoomPresencePayload(
			participant.id,
			this.getOnlineParticipantIds(roomId),
		);
		this.server.to(roomId).emit(ROOM_SOCKET_EVENTS.PARTICIPANT_LEFT, payload);
	}

	public getOnlineParticipantIds(roomId: string): string[] {
		return Array.from(this.roomParticipants.get(roomId) ?? []);
	}

	private addParticipantToRoom(roomId: string, participantId: string) {
		if (!this.roomParticipants.has(roomId)) {
			this.roomParticipants.set(roomId, new Set());
		}
		this.roomParticipants.get(roomId)!.add(participantId);
	}

	private removeParticipantFromRoom(roomId: string, participantId: string) {
		const room = this.roomParticipants.get(roomId);
		if (!room) return;

		room.delete(participantId);
		if (room?.size === 0) {
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
