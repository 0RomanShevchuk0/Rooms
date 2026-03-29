import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthUser } from '../auth/types/auth-user.type';
import {
	GetChatByIdParamsSchema,
	GetChatMessagesQuerySchema,
	type GetChatByIdParams,
	type GetChatByIdResponse,
	type GetChatMessagesQuery,
	type GetChatMessagesResponse,
} from '@rooms/contracts/chat';
import type { MessageWithSender } from '../messages/messages.types';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
	constructor(private readonly chatsService: ChatsService) {}

	@Get(':id')
	async findOne(
		@Param(new ZodValidationPipe(GetChatByIdParamsSchema))
		params: GetChatByIdParams,
		@CurrentUser() user: AuthUser,
	): Promise<GetChatByIdResponse> {
		const chat = await this.chatsService.findOne(params.id, user.id);
		return {
			id: chat.id,
			roomId: chat.roomId,
			createdAt: chat.createdAt.toISOString(),
		};
	}

	@Get(':id/messages')
	async getMessages(
		@Param(new ZodValidationPipe(GetChatByIdParamsSchema))
		params: GetChatByIdParams,
		@Query(new ZodValidationPipe(GetChatMessagesQuerySchema))
		query: GetChatMessagesQuery,
		@CurrentUser() user: AuthUser,
	): Promise<GetChatMessagesResponse> {
		const result = await this.chatsService.getChatMessages(
			params.id,
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
