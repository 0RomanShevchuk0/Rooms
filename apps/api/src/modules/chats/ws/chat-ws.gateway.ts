import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import type { Server } from 'socket.io';
import { CHAT_SOCKET_EVENTS } from './chat-ws.constants';
import { ChatsService } from '../chats.service';
import { ChatConnectionDto } from '../dto/ws/chat-connection.dto';
import {
	ForbiddenException,
	NotFoundException,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { SendMessageDto } from '../dto/ws/send-message.dto';
import { type SocketWithAuth } from 'src/realtime/ws/api-socket-io.adapter';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];

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
		origin: allowedOrigins,
		credentials: true,
	},
})
export class ChatWsGateway {
	@WebSocketServer()
	server!: Server;

	constructor(private readonly chatsService: ChatsService) {}

	@SubscribeMessage(CHAT_SOCKET_EVENTS.CONNECT)
	async connectToChat(
		@ConnectedSocket() client: SocketWithAuth,
		@MessageBody() body: ChatConnectionDto,
	) {
		const senderId = client.data.user?.sub;
		if (!senderId) {
			return { error: 'Unauthorized' };
		}

		try {
			await this.chatsService.getChatForUserOrThrow(body.chatId, senderId);
		} catch (error) {
			return this.mapServiceError(error);
		}

		await client.join(body.chatId);
		return { ok: true };
	}

	@SubscribeMessage(CHAT_SOCKET_EVENTS.DISCONNECT)
	async disconnectFromChat(
		@ConnectedSocket() client: SocketWithAuth,
		@MessageBody() body: ChatConnectionDto,
	) {
		await client.leave(body.chatId);
		return { ok: true };
	}

	@SubscribeMessage(CHAT_SOCKET_EVENTS.MESSAGE)
	async sendMessage(
		@ConnectedSocket() client: SocketWithAuth,
		@MessageBody() body: SendMessageDto,
	) {
		const senderId = client.data.user?.sub;
		if (!senderId) {
			return { error: 'Unauthorized' };
		}

		try {
			const message = await this.chatsService.sendMessage(senderId, body);

			client.to(body.chatId).emit(CHAT_SOCKET_EVENTS.MESSAGE, message);

			return message;
		} catch (error) {
			return this.mapServiceError(error);
		}
	}

	private mapServiceError(error: unknown) {
		if (error instanceof ForbiddenException) {
			return { error: 'Forbidden' };
		}

		if (error instanceof NotFoundException) {
			return { error: 'Not found' };
		}

		return { error: 'Internal error' };
	}
}
