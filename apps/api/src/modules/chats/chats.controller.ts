import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthUser } from '../auth/types/auth-user.type';
import type {
	GetChatByIdResponse,
	GetChatMessagesResponse,
} from '@rooms/contracts/chat';
import type { MessageWithSender } from '../messages/messages.types';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
	constructor(private readonly chatsService: ChatsService) {}

	@Get(':id')
	async findOne(
		@Param('id') id: string,
		@CurrentUser() user: AuthUser,
	): Promise<GetChatByIdResponse> {
		const chat = await this.chatsService.findOne(id, user.id);
		return {
			id: chat.id,
			roomId: chat.roomId,
			createdAt: chat.createdAt.toISOString(),
		};
	}

	@Get(':id/messages')
	async getMessages(
		@Param('id') id: string,
		@Query() query: GetMessagesQueryDto,
		@CurrentUser() user: AuthUser,
	): Promise<GetChatMessagesResponse> {
		const result = await this.chatsService.getChatMessages(
			id,
			user.id,
			query.cursor,
			query.limit,
		);

		return {
			items: result.items.map((message) =>
				this.toMessageWithSender(message),
			),
			nextCursor: result.nextCursor,
		};
	}

	private toMessageWithSender(message: MessageWithSender) {
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
