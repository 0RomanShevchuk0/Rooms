import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
	constructor(private readonly chatsService: ChatsService) {}

	@Post()
	create(@Body() createChatDto: CreateChatDto) {
		return this.chatsService.create(createChatDto);
	}

	@Get()
	findAll() {
		return this.chatsService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.chatsService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
		return this.chatsService.update(id, updateChatDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.chatsService.remove(id);
	}
}
