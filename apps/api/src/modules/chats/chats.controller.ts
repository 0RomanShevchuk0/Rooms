import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthUser } from '../auth/types/auth-user.type';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
	constructor(private readonly chatsService: ChatsService) {}

	@Get(':id')
	async findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
		const chat = await this.chatsService.findOne(id, user.id);
		return chat;
	}

	@Get(':id/messages')
	getMessages(
		@Param('id') id: string,
		@Query() query: GetMessagesQueryDto,
		@CurrentUser() user: AuthUser,
	) {
		return this.chatsService.getChatMessages(
			id,
			user.id,
			query.cursor,
			query.limit,
		);
	}
}
