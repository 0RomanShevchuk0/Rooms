import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class ChatsService {
	constructor(
		private prisma: PrismaService,
		private messagesService: MessagesService,
	) {}

	create(createChatDto: CreateChatDto) {
		return this.prisma.chat.create({
			data: {
				room: {
					connect: { id: createChatDto.roomId },
				},
			},
		});
	}

	findAll() {
		return this.prisma.chat.findMany();
	}

	findOne(id: string) {
		return this.prisma.chat.findUnique({
			where: { id },
		});
	}

	findOneByRoomId(roomId: string) {
		return this.prisma.chat.findFirst({
			where: { roomId },
		});
	}

	update(id: string, updateChatDto: UpdateChatDto) {
		return this.prisma.chat.update({
			where: { id },
			data: updateChatDto,
		});
	}

	remove(id: string) {
		return this.prisma.chat.delete({
			where: { id },
		});
	}

	async sendMessage(chatId: string, senderId: string, content: string) {
		const message = await this.messagesService.create(senderId, {
			chatId,
			content,
			senderId,
		});
		return message;
	}
}
