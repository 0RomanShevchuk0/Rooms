import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateRoomPartisipantDto } from './dto/create-room-partisipant.dto';
import { UpdateRoomPartisipantDto } from './dto/update-room-partisipant.dto';
import { publicUserSelect } from 'src/modules/users/users.select';

@Injectable()
export class RoomPartisipantsService {
	constructor(private prisma: PrismaService) {}

	create(createRoomPartisipantDto: CreateRoomPartisipantDto) {
		return this.prisma.roomParticipant.create({
			data: {
				roomId: createRoomPartisipantDto.roomId,
				userId: createRoomPartisipantDto.userId,
				isReady: createRoomPartisipantDto.isReady ?? false,
			},
			include: { user: { select: publicUserSelect } },
		});
	}

	findAll() {
		return this.prisma.roomParticipant.findMany({
			include: { user: { select: publicUserSelect } },
		});
	}

	findOne(id: string) {
		return this.prisma.roomParticipant.findUnique({
			where: { id },
			include: { user: { select: publicUserSelect } },
		});
	}

	update(id: string, updateRoomPartisipantDto: UpdateRoomPartisipantDto) {
		return this.prisma.roomParticipant.update({
			where: { id },
			data: updateRoomPartisipantDto,
			include: { user: { select: publicUserSelect } },
		});
	}

	remove(id: string) {
		return this.prisma.roomParticipant.delete({
			where: { id },
		});
	}

	removeByRoomAndUser(roomId: string, userId: string) {
		return this.prisma.roomParticipant.delete({
			where: { roomId_userId: { roomId, userId } },
			include: { user: { select: publicUserSelect } },
		});
	}

	findByRoomAndUser(roomId: string, userId: string) {
		return this.prisma.roomParticipant.findUnique({
			where: { roomId_userId: { roomId, userId } },
			include: { user: { select: publicUserSelect } },
		});
	}

	setReady(roomId: string, userId: string, isReady: boolean) {
		return this.prisma.roomParticipant.update({
			where: {
				roomId_userId: {
					roomId,
					userId,
				},
			},
			data: { isReady },
			include: { user: { select: publicUserSelect } },
		});
	}
}
