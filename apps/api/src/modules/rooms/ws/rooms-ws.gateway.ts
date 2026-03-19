import {
	ConnectedSocket,
	MessageBody,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import type { Server } from 'socket.io';
import { ROOM_SOCKET_EVENTS } from './rooms-ws.constants';
import type {
	RoomsSocket,
	RoomPresencePayload,
	RoomParticipantJoinedPayload,
	RoomParticipantLeftPayload,
	RoomsSocketData,
} from './rooms-ws.types';
import { RoomParticipantWithUser } from '../participants/room-participants.select';
import { RoomConnectionDto } from '../dto/ws/room-connection.dto';

@UsePipes(
	new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true,
	}),
)
@WebSocketGateway({
	namespace: '/rooms',
	cors: {
		origin: '*',
		credentials: true,
	},
})
export class RoomsWsGateway implements OnGatewayDisconnect {
	@WebSocketServer()
	server!: Server;

	private roomParticipants = new Map<string, Set<string>>();
	private socketContexts = new Map<string, RoomsSocketData>();

	handleDisconnect(client: RoomsSocket) {
		const context = this.socketContexts.get(client.id);
		if (!context) {
			return;
		}

		this.removeParticipantFromRoom(context.roomId, context.participantId);
		this.clearSocketContextIfSessionMatches(
			client.id,
			context.sessionVersion,
		);

		const payload: RoomPresencePayload = {
			participantId: context.participantId,
			onlineParticipantIds: this.getOnlineParticipantIds(context.roomId),
		};
		this.server
			.to(context.roomId)
			.emit(ROOM_SOCKET_EVENTS.DISCONNECT, payload);
	}

	@SubscribeMessage(ROOM_SOCKET_EVENTS.CONNECT)
	async connectToRoom(
		@ConnectedSocket() client: RoomsSocket,
		@MessageBody() body: RoomConnectionDto,
	) {
		const sessionVersion = this.getNextSessionVersion(client.id);
		const context: RoomsSocketData = {
			participantId: body.participantId,
			roomId: body.roomId,
			sessionVersion,
		};
		this.socketContexts.set(client.id, context);

		this.addParticipantToRoom(body.roomId, body.participantId);
		await client.join(body.roomId);

		const payload: RoomPresencePayload = {
			participantId: body.participantId,
			onlineParticipantIds: this.getOnlineParticipantIds(body.roomId),
		};

		this.server.to(body.roomId).emit(ROOM_SOCKET_EVENTS.CONNECT, payload);

		return { ok: true };
	}

	@SubscribeMessage(ROOM_SOCKET_EVENTS.DISCONNECT)
	async disconnectFromRoom(@ConnectedSocket() client: RoomsSocket) {
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

		const payload: RoomPresencePayload = {
			participantId: context.participantId,
			onlineParticipantIds: this.getOnlineParticipantIds(context.roomId),
		};

		this.server
			.to(context.roomId)
			.emit(ROOM_SOCKET_EVENTS.DISCONNECT, payload);

		return { ok: true };
	}

	public notifyParticipantJoined(
		roomId: string,
		participant: RoomParticipantWithUser,
	) {
		const payload: RoomParticipantJoinedPayload = {
			participantId: participant.id,
			onlineParticipantIds: this.getOnlineParticipantIds(roomId),
			participant,
		};
		this.server
			.to(roomId)
			.emit(ROOM_SOCKET_EVENTS.PARTICIPANT_JOINED, payload);
	}

	public notifyParticipantLeft(
		roomId: string,
		participant: RoomParticipantWithUser,
	) {
		const payload: RoomParticipantLeftPayload = {
			participantId: participant.id,
			onlineParticipantIds: this.getOnlineParticipantIds(roomId),
		};
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
