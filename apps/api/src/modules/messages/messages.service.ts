import { Injectable } from '@nestjs/common';
import type { CreateMessageInput } from './inputs/create-message.input';
import { PrismaService } from 'src/database/prisma/prisma.service';
import {
	messageWithSenderSelect,
	type PaginatedMessages,
} from './messages.types';

@Injectable()
export class MessagesService {
	constructor(private prisma: PrismaService) {}

	create(senderId: string, createMessageDto: CreateMessageInput) {
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
}
