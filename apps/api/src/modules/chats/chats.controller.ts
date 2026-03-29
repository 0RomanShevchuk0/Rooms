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
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';
import {
	toGetChatByIdResponse,
	toMessageWithSenderPayload,
} from './chats.mapper';

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
		return toGetChatByIdResponse(chat);
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
			items: result.items.map(toMessageWithSenderPayload),
			nextCursor: result.nextCursor,
		};
	}
}
