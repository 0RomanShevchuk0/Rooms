import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from './socket-events';

@WebSocketGateway({
	namespace: '/events',
	cors: {
		origin: '*',
		credentials: true,
	},
})
export class EventsWsGateway {
	@WebSocketServer()
	server!: Server;

	handleConnection(client: Socket) {
		console.log('WS Client connected', client.id);
	}

	handleDisconnect(client: Socket) {
		console.log('WS Client disconnected', client.id);
	}

	@SubscribeMessage(SOCKET_EVENTS.ROOM_JOIN)
	async joinRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: { roomId: string },
	) {
		await client.join(body.roomId);
		console.log(`Client ${client.id} joined room ${body.roomId}`);
		return { ok: true };
	}

	@SubscribeMessage(SOCKET_EVENTS.ROOM_LEAVE)
	async leaveRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: { roomId: string },
	) {
		await client.leave(body.roomId);
		console.log(`Client ${client.id} left room ${body.roomId}`);
		return { ok: true };
	}
}
