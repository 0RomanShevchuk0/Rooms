import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Room } from 'generated/prisma/client';
import { RoomJoinLeaveResult, RoomWithPartisipants } from './rooms.types';
import { roomPartisipantWithUserSelect } from './partisipants/room-partisipants.select';
import { RoomPartisipantsService } from './partisipants/room-partisipants.service';

@Injectable()
export class RoomsService {
	constructor(
		private prisma: PrismaService,
		private readonly participantsService: RoomPartisipantsService,
	) {}

	findMany(filters?: { userId?: string }): Promise<RoomWithPartisipants[]> {
		return this.prisma.room.findMany({
			where: {
				...(filters?.userId && {
					participants: { some: { userId: filters.userId } },
				}),
			},
			include: { participants: { select: roomPartisipantWithUserSelect } },
		});
	}

	findById(id: string): Promise<RoomWithPartisipants | null> {
		return this.prisma.room.findUnique({
			where: { id },
			include: {
				participants: { select: roomPartisipantWithUserSelect },
				chat: {
					include: {
						messages: true,
					},
				},
			},
		});
	}

	async create(createRoomDto: CreateRoomDto): Promise<RoomWithPartisipants> {
		const userIds = Array.from(new Set(createRoomDto.userIds || []));

		const existingUsers = await this.prisma.user.findMany({
			where: {
				id: { in: userIds },
				deletedAt: null,
			},
			select: { id: true },
		});

		if (existingUsers.length !== userIds.length) {
			const existingIds = new Set(existingUsers.map((u) => u.id));
			const missingParticipantIds = userIds.filter(
				(id) => !existingIds.has(id),
			);

			throw new BadRequestException({
				message: 'Some users were not found',
				missingParticipantIds,
			});
		}

		const existingUserIds = existingUsers.map(({ id }) => ({
			userId: id,
		}));

		return this.prisma.room.create({
			data: {
				name: createRoomDto.name,
				description: createRoomDto.description,
				participants: {
					createMany: {
						data: existingUserIds,
						skipDuplicates: true,
					},
				},
				chat: {
					create: {},
				},
			},
			include: {
				participants: { select: roomPartisipantWithUserSelect },
				chat: true,
			},
		});
	}

	async join(id: string, userId: string): Promise<RoomJoinLeaveResult> {
		const room = await this.prisma.room.findUnique({ where: { id } });

		if (!room) throw new NotFoundException(`Room "${id}" not found`);

		const participant = await this.participantsService.create({
			roomId: id,
			userId,
		});

		const updatedRoom = await this.findById(id);
		if (!updatedRoom) throw new NotFoundException(`Room "${id}" not found`);

		return { room: updatedRoom, participant };
	}

	async leave(id: string, userId: string): Promise<RoomJoinLeaveResult> {
		const deletedParticipant =
			await this.participantsService.removeByRoomAndUser(id, userId);

		const updatedRoom = await this.findById(id);
		if (!updatedRoom) throw new NotFoundException(`Room "${id}" not found`);

		return { room: updatedRoom, participant: deletedParticipant };
	}

	update(
		id: string,
		updateRoomDto: UpdateRoomDto,
	): Promise<RoomWithPartisipants> {
		return this.prisma.room.update({
			where: { id },
			data: updateRoomDto,
			include: { participants: { select: roomPartisipantWithUserSelect } },
		});
	}

	remove(id: string): Promise<Room> {
		return this.prisma.room.delete({
			where: { id },
		});
	}
}
