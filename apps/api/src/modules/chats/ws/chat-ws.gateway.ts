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
import { SendMessageDto } from '../dto/ws/send-message.dto';
import { type SocketWithAuth } from 'src/realtime/ws/api-socket-io.adapter';
import { ApiWsHandler } from 'src/realtime/ws/api-ws-handler.decorator';
import { requireWsUser } from 'src/realtime/ws/require-ws-user';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];

@ApiWsHandler()
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
		const userId = requireWsUser(client).sub;
		await this.chatsService.getChatForUserOrThrow(body.chatId, userId);

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
		const senderId = requireWsUser(client).sub;
		const message = await this.chatsService.sendMessage(senderId, body);
		client.to(body.chatId).emit(CHAT_SOCKET_EVENTS.MESSAGE, message);
		return message;
	}
}
