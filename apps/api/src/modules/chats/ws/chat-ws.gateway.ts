import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
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
import { AuthService } from '../../../modules/auth/auth.service';

@WebSocketGateway({
	namespace: '/chat',
	cors: {
		origin: '*',
		credentials: true,
	},
})
export class ChatWsGateway implements OnGatewayConnection {
	@WebSocketServer()
	server!: Server;

	constructor(
		private readonly chatsService: ChatsService,
		private readonly authService: AuthService,
	) {}

	handleConnection(client: Socket) {
		const token = client.handshake.auth?.token as string;
		const payload = this.authService.verifyAccessToken(token);

		if (!payload?.sub) {
			client.disconnect();
			return;
		}
	}

	@SubscribeMessage(CHAT_SOCKET_EVENTS.CONNECT)
	async connectToChat(
		@ConnectedSocket() client: Socket,
		@MessageBody() body: ChatConnectPayload,
	) {
		await client.join(body.chatId);
		return { ok: true };
	}

	@SubscribeMessage(CHAT_SOCKET_EVENTS.DISCONNECT)
	async disconnectFromChat(
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

		client.to(body.chatId).emit(CHAT_SOCKET_EVENTS.MESSAGE, message);

		return message;
	}
}
