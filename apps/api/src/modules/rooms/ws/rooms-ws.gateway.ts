import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { ROOM_SOCKET_EVENTS } from './rooms-ws.constants';
import type { PublicUser } from '../../users/users.select';

@WebSocketGateway({
	namespace: '/rooms',
	cors: {
		origin: '*',
		credentials: true,
	},
})
export class RoomsWsGateway {
	@WebSocketServer()
	server!: Server;

	notifyPlayerJoined(roomId: string, player: PublicUser) {
		this.server.to(roomId).emit(ROOM_SOCKET_EVENTS.PLAYER_JOINED, { player });
	}

	notifyPlayerLeft(roomId: string, player: PublicUser) {
		this.server.to(roomId).emit(ROOM_SOCKET_EVENTS.PLAYER_LEFT, { player });
	}

	@SubscribeMessage(ROOM_SOCKET_EVENTS.CONNECT)
	async connectToRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: { roomId: string; playerId: string },
	) {
		await client.join(body.roomId);
		client.to(body.roomId).emit(ROOM_SOCKET_EVENTS.CONNECT, {
			player: {
				id: body.playerId,
			},
		});
		return { ok: true };
	}

	@SubscribeMessage(ROOM_SOCKET_EVENTS.DISCONNECT)
	async disconnectFromRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: { roomId: string; playerId: string },
	) {
		await client.leave(body.roomId);
		client.to(body.roomId).emit(ROOM_SOCKET_EVENTS.DISCONNECT, {
			player: {
				id: body.playerId,
			},
		});
		return { ok: true };
	}
}
