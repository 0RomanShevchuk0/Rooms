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
import { ChatConnectionDto } from '../dto/ws/chat-connection.dto';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { SendMessageDto } from '../dto/ws/send-message.dto';

@UsePipes(
	new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true,
	}),
)
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
	async connectToChat(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: ChatConnectionDto,
	) {
		await client.join(body.chatId);
		return { ok: true };
	}

	@SubscribeMessage(CHAT_SOCKET_EVENTS.DISCONNECT)
	async disconnectFromChat(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: ChatConnectionDto,
	) {
		await client.leave(body.chatId);
		return { ok: true };
	}

	@SubscribeMessage(CHAT_SOCKET_EVENTS.MESSAGE)
	async sendMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: SendMessageDto,
	) {
		// todo: validate access to the chat
		const message = await this.chatsService.sendMessage(
			body.chatId,
			body.senderId,
			body.content,
		);

		client.to(body.chatId).emit(CHAT_SOCKET_EVENTS.MESSAGE, message);

		return message;
	}
}
