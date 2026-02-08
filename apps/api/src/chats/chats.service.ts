import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatsService {
	constructor(private prisma: PrismaService) {}

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
		return this.prisma.chat.findMany({
			include: {
				messages: true,
			},
		});
	}

	findOne(id: string) {
		return this.prisma.chat.findUnique({
			where: { id },
			include: {
				messages: true,
			},
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
}
