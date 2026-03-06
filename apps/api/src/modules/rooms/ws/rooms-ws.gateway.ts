import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { ROOM_SOCKET_EVENTS } from './rooms-ws.constants';
import type { PublicUser } from '../../users/users.select';
import type {
	RoomsSocket,
	RoomConnectPayload,
	RoomPresencePayload,
	RoomPlayerJoinedPayload,
	RoomPlayerLeftPayload,
	RoomsSocketData,
} from './rooms-ws.types';

@WebSocketGateway({
	namespace: '/rooms',
	cors: {
		origin: '*',
		credentials: true,
	},
})
export class RoomsWsGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server!: Server;

	private roomPlayers = new Map<string, Set<string>>();
	private socketContexts = new Map<string, RoomsSocketData>();

	handleConnection(client: Socket) {
		void client;
	}

	handleDisconnect(client: RoomsSocket) {
		const context = this.socketContexts.get(client.id);
		if (!context) {
			return;
		}

		this.removePlayerFromRoom(context.roomId, context.playerId);
		this.clearSocketContextIfSessionMatches(
			client.id,
			context.sessionVersion,
		);

		const payload: RoomPresencePayload = {
			playerId: context.playerId,
			onlinePlayerIds: this.getOnlinePlayerIds(context.roomId),
		};
		this.server
			.to(context.roomId)
			.emit(ROOM_SOCKET_EVENTS.DISCONNECT, payload);
	}

	@SubscribeMessage(ROOM_SOCKET_EVENTS.CONNECT)
	async connectToRoom(
		@ConnectedSocket() client: RoomsSocket,
		@MessageBody() body: RoomConnectPayload,
	) {
		const sessionVersion = this.getNextSessionVersion(client.id);
		const context: RoomsSocketData = {
			playerId: body.playerId,
			roomId: body.roomId,
			sessionVersion,
		};
		this.socketContexts.set(client.id, context);

		this.addPlayerToRoom(body.roomId, body.playerId);
		await client.join(body.roomId);

		const payload: RoomPresencePayload = {
			playerId: body.playerId,
			onlinePlayerIds: this.getOnlinePlayerIds(body.roomId),
		};

		this.server.to(body.roomId).emit(ROOM_SOCKET_EVENTS.CONNECT, payload);

		return { ok: true };
	}

	@SubscribeMessage(ROOM_SOCKET_EVENTS.DISCONNECT)
	async disconnectFromRoom(@ConnectedSocket() client: RoomsSocket) {
		const context = this.socketContexts.get(client.id);
		if (!context) {
			console.log('disconnectFromRoom: no context');
			return { ok: true };
		}

		this.removePlayerFromRoom(context.roomId, context.playerId);
		await client.leave(context.roomId);
		this.clearSocketContextIfSessionMatches(
			client.id,
			context.sessionVersion,
		);

		const payload: RoomPresencePayload = {
			playerId: context.playerId,
			onlinePlayerIds: this.getOnlinePlayerIds(context.roomId),
		};

		this.server
			.to(context.roomId)
			.emit(ROOM_SOCKET_EVENTS.DISCONNECT, payload);

		return { ok: true };
	}

	public notifyPlayerJoined(roomId: string, player: PublicUser) {
		const payload: RoomPlayerJoinedPayload = {
			playerId: player.id,
			onlinePlayerIds: this.getOnlinePlayerIds(roomId),
			player,
		};
		this.server.to(roomId).emit(ROOM_SOCKET_EVENTS.PLAYER_JOINED, payload);
	}

	public notifyPlayerLeft(roomId: string, player: PublicUser) {
		const payload: RoomPlayerLeftPayload = {
			playerId: player.id,
			onlinePlayerIds: this.getOnlinePlayerIds(roomId),
		};
		this.server.to(roomId).emit(ROOM_SOCKET_EVENTS.PLAYER_LEFT, payload);
	}

	public getOnlinePlayerIds(roomId: string): string[] {
		return Array.from(this.roomPlayers.get(roomId) ?? []);
	}

	private addPlayerToRoom(roomId: string, playerId: string) {
		if (!this.roomPlayers.has(roomId)) {
			this.roomPlayers.set(roomId, new Set());
		}
		this.roomPlayers.get(roomId)!.add(playerId);
	}

	private removePlayerFromRoom(roomId: string, playerId: string) {
		const room = this.roomPlayers.get(roomId);
		if (!room) return;

		room.delete(playerId);
		if (room?.size === 0) {
			this.roomPlayers.delete(roomId);
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
