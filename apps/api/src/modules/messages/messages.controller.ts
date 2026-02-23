import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	NotFoundException,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthUser } from '../auth/types/auth-user.type';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
	constructor(private readonly messagesService: MessagesService) {}

	@Post()
	create(
		@CurrentUser() user: AuthUser,
		@Body() createMessageDto: CreateMessageDto,
	) {
		return this.messagesService.create(user.id, createMessageDto);
	}

	@Get()
	findAll() {
		return this.messagesService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		const message = await this.messagesService.findOne(id);
		if (!message) {
			throw new NotFoundException(`Message "${id}" not found`);
		}
		return message;
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
		return this.messagesService.update(id, updateMessageDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.messagesService.remove(id);
	}
}
