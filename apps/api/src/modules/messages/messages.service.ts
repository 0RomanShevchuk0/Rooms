import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import {
	messageWithSenderSelect,
	type PaginatedMessages,
} from './messages.types';

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
			select: messageWithSenderSelect,
		});
	}

	async findByChatId(
		chatId: string,
		cursor?: string,
		limit = 20,
	): Promise<PaginatedMessages> {
		const messages = await this.prisma.message.findMany({
			where: { chatId },
			orderBy: { createdAt: 'desc' },
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			select: messageWithSenderSelect,
		});

		const hasMore = messages.length > limit;
		const items = hasMore ? messages.slice(0, limit) : messages;
		const nextCursor = hasMore ? items[items.length - 1].id : null;

		return { items, nextCursor };
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
