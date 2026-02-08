import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class MessagesService {
	constructor(private prisma: PrismaService) {}

	create(senderId: string, createMessageDto: CreateMessageDto) {
		return this.prisma.message.create({
			data: {
				content: createMessageDto.content,
				sender: {
					connect: {
						id: senderId,
					},
				},
				chat: {
					connect: {
						id: createMessageDto.chatId,
					},
				},
			},
		});
	}

	findAll() {
		return this.prisma.message.findMany({
			include: {
				sender: true,
				chat: true,
			},
		});
	}

	findOne(id: string) {
		return this.prisma.message.findUnique({
			where: { id },
			include: {
				sender: true,
				chat: true,
			},
		});
	}

	update(id: string, updateMessageDto: UpdateMessageDto) {
		return this.prisma.message.update({
			where: { id },
			data: updateMessageDto,
		});
	}

	remove(id: string) {
		return this.prisma.message.delete({
			where: { id },
		});
	}
}
