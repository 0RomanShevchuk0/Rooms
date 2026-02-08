import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('messages')
export class MessagesController {
	constructor(private readonly messagesService: MessagesService) {}

	@Post()
	create(@Body() createMessageDto: CreateMessageDto) {
		// todo: get user from auth
		const senderId = createMessageDto.senderId;
		return this.messagesService.create(senderId, createMessageDto);
	}

	@Get()
	findAll() {
		return this.messagesService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.messagesService.findOne(id);
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
