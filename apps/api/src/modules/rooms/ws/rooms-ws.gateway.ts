import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { ROOM_SOCKET_EVENTS } from './rooms-ws.constants';

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

	@SubscribeMessage(ROOM_SOCKET_EVENTS.ROOM_CONNECT)
	async connectToRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: { roomId: string },
	) {
		await client.join(body.roomId);
		return { ok: true };
	}

	@SubscribeMessage(ROOM_SOCKET_EVENTS.ROOM_DISCONNECT)
	async disconnectFromRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: { roomId: string },
	) {
		await client.leave(body.roomId);
		return { ok: true };
	}
}
