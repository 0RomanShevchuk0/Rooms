import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';
import type { ChatSendMessagePayload } from '@rooms/contracts/chat';
import { DomainError } from 'src/shared/errors/domain.error';

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

	async findOne(chatId: string, userId: string) {
		const chat = await this.getChatForUserOrThrow(chatId, userId);
		return {
			id: chat.id,
			roomId: chat.roomId,
			createdAt: chat.createdAt,
		};
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

	async getChatMessages(
		chatId: string,
		userId: string,
		cursor?: string,
		limit = 20,
	) {
		await this.getChatForUserOrThrow(chatId, userId);

		return this.messagesService.findByChatId(chatId, cursor, limit);
	}

	async sendMessage(senderId: string, body: ChatSendMessagePayload) {
		const { chatId, content } = body;

		await this.getChatForUserOrThrow(chatId, senderId);

		const message = await this.messagesService.create(senderId, {
			chatId,
			content,
		});
		return message;
	}

	async hasUserAccessToChat(chatId: string, userId: string) {
		const chat = await this.findChatWithUserParticipant(chatId, userId);
		const isParticipant = Boolean(chat?.room.participants.length);

		return isParticipant;
	}

	async getChatForUserOrThrow(chatId: string, userId: string) {
		const chat = await this.findChatWithUserParticipant(chatId, userId);
		if (!chat) {
			throw DomainError.notFound(`Chat "${chatId}" not found`, {
				entity: 'chat',
				chatId,
			});
		}

		if (chat.room.participants.length === 0) {
			throw DomainError.accessDenied(
				'You are not a participant of this room',
				{
					entity: 'chat',
					chatId,
					userId,
				},
			);
		}

		return chat;
	}

	private findChatWithUserParticipant(chatId: string, userId: string) {
		return this.prisma.chat.findUnique({
			where: { id: chatId },
			include: {
				room: {
					select: {
						participants: {
							where: { userId },
							select: { id: true, userId: true },
							take: 1,
						},
					},
				},
			},
		});
	}
}
