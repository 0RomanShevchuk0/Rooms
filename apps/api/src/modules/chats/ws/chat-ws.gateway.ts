import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { CHAT_SOCKET_EVENTS } from './chat-ws.constants';
import { ChatsService } from '../chats.service';
import type {
	ChatConnectPayload,
	ChatDisconnectPayload,
	ChatMessagePayload,
} from './chat-ws.types';

@WebSocketGateway({
	namespace: '/chat',
	cors: {
		origin: '*',
		credentials: true,
	},
})
export class ChatWsGateway {
	@WebSocketServer()
	server!: Server;

	constructor(private readonly chatsService: ChatsService) {}

	@SubscribeMessage(CHAT_SOCKET_EVENTS.CONNECT)
	async connectToRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: ChatConnectPayload,
	) {
		await client.join(body.chatId);
		return { ok: true };
	}

	@SubscribeMessage(CHAT_SOCKET_EVENTS.DISCONNECT)
	async disconnectFromRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: ChatDisconnectPayload,
	) {
		await client.leave(body.chatId);
		return { ok: true };
	}

	@SubscribeMessage(CHAT_SOCKET_EVENTS.MESSAGE)
	async sendMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: ChatMessagePayload,
	) {
		const message = await this.chatsService.sendMessage(
			body.chatId,
			body.senderId,
			body.content,
		);
		console.log('🚀 ~ ChatWsGateway ~ sendMessage ~ message:', message);

		client.to(body.chatId).emit(CHAT_SOCKET_EVENTS.MESSAGE, message);

		return message;
	}
}
