import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Query,
	UseGuards,
	NotFoundException,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthUser } from '../auth/types/auth-user.type';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
	constructor(private readonly chatsService: ChatsService) {}

	@Post()
	create(@Body() createChatDto: CreateChatDto) {
		return this.chatsService.create(createChatDto);
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		const chat = await this.chatsService.findOne(id);
		if (!chat) {
			throw new NotFoundException(`Chat "${id}" not found`);
		}
		return chat;
	}

	@Get(':id/messages')
	getMessages(
		@Param('id') id: string,
		@Query() query: GetMessagesQueryDto,
		@CurrentUser() user: AuthUser,
	) {
		return this.chatsService.getMessages(
			id,
			user.id,
			query.cursor,
			query.limit,
		);
	}
}
