import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import type { Server } from 'socket.io';
import { ChatsService } from '../chats.service';
import {
	CHAT_SOCKET_EVENTS,
	type ChatMessagePayload,
	ChatConnectionPayloadSchema,
	ChatSendMessagePayloadSchema,
	type ChatConnectionPayload,
	type ChatSendMessagePayload,
} from '@rooms/contracts/chat';
import { type SocketWithAuth } from 'src/realtime/ws/api-socket-io.adapter';
import { ApiWsHandler } from 'src/realtime/ws/api-ws-handler.decorator';
import { requireWsUser } from 'src/realtime/ws/require-ws-user';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';
import type { MessageWithSender } from 'src/modules/messages/messages.types';

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
		@MessageBody(new ZodValidationPipe(ChatConnectionPayloadSchema))
		body: ChatConnectionPayload,
	) {
		const userId = requireWsUser(client).sub;
		await this.chatsService.getChatForUserOrThrow(body.chatId, userId);

		await client.join(body.chatId);
		return { ok: true };
	}

	@SubscribeMessage(CHAT_SOCKET_EVENTS.DISCONNECT)
	async disconnectFromChat(
		@ConnectedSocket() client: SocketWithAuth,
		@MessageBody(new ZodValidationPipe(ChatConnectionPayloadSchema))
		body: ChatConnectionPayload,
	) {
		await client.leave(body.chatId);
		return { ok: true };
	}

	@SubscribeMessage(CHAT_SOCKET_EVENTS.MESSAGE)
	async sendMessage(
		@ConnectedSocket() client: SocketWithAuth,
		@MessageBody(new ZodValidationPipe(ChatSendMessagePayloadSchema))
		body: ChatSendMessagePayload,
	) {
		const senderId = requireWsUser(client).sub;
		const message = await this.chatsService.sendMessage(senderId, body);
		const payload = this.toChatMessagePayload(message);

		client.to(body.chatId).emit(CHAT_SOCKET_EVENTS.MESSAGE, payload);
		return payload;
	}

	private toChatMessagePayload(
		message: MessageWithSender,
	): ChatMessagePayload {
		return {
			id: message.id,
			content: message.content,
			chatId: message.chatId,
			senderId: message.senderId,
			createdAt: message.createdAt.toISOString(),
			sender: {
				id: message.sender.id,
				username: message.sender.username,
				email: message.sender.email,
				name: message.sender.name,
				deletedAt: message.sender.deletedAt
					? message.sender.deletedAt.toISOString()
					: null,
			},
		};
	}
}
