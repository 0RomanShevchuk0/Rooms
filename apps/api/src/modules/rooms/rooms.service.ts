import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Room } from 'generated/prisma/client';

@Injectable()
export class RoomsService {
	constructor(private prisma: PrismaService) {}

	findMany(filters?: { userId?: string }): Promise<Room[]> {
		return this.prisma.room.findMany({
			where: {
				...(filters?.userId && {
					players: { some: { id: filters.userId } },
				}),
			},
			include: { players: true },
		});
	}

	findById(id: string) {
		return this.prisma.room.findUnique({
			where: { id },
			include: {
				players: true,
				chat: {
					include: {
						messages: true,
					},
				},
			},
		});
	}

	async create(createRoomDto: CreateRoomDto) {
		const participantIds = Array.from(
			new Set(createRoomDto.participantIds || []),
		);

		const existingUsers = await this.prisma.user.findMany({
			where: {
				id: { in: participantIds },
				deletedAt: null,
			},
			select: { id: true },
		});

		if (existingUsers.length !== participantIds.length) {
			const existingIds = new Set(existingUsers.map((u) => u.id));
			const missingParticipantIds = participantIds.filter(
				(id) => !existingIds.has(id),
			);

			throw new BadRequestException({
				message: 'Some participantIds were not found',
				missingParticipantIds,
			});
		}

		const participants = existingUsers.map(({ id }) => ({ id }));

		return this.prisma.room.create({
			data: {
				name: createRoomDto.name,
				description: createRoomDto.description,
				players: {
					connect: participants,
				},
				chat: {
					create: {},
				},
			},
			include: {
				players: true,
				chat: true,
			},
		});
	}

	async join(id: string, userId: string) {
		const [room, user] = await Promise.all([
			this.prisma.room.findUnique({ where: { id } }),
			this.prisma.user.findUnique({ where: { id: userId } }),
		]);

		if (!room) throw new NotFoundException(`Room "${id}" not found`);
		if (!user) throw new NotFoundException(`User "${userId}" not found`);

		return this.prisma.room.update({
			where: { id },
			data: { players: { connect: { id: userId } } },
			include: { players: true },
		});
	}

	async leave(id: string, userId: string) {
		const [room, user] = await Promise.all([
			this.prisma.room.findUnique({ where: { id } }),
			this.prisma.user.findUnique({ where: { id: userId } }),
		]);

		if (!room) throw new NotFoundException(`Room "${id}" not found`);
		if (!user) throw new NotFoundException(`User "${userId}" not found`);

		return this.prisma.room.update({
			where: { id },
			data: { players: { disconnect: { id: userId } } },
			include: { players: true },
		});
	}

	update(id: string, updateRoomDto: UpdateRoomDto) {
		return this.prisma.room.update({
			where: { id },
			data: updateRoomDto,
			include: { players: true },
		});
	}

	remove(id: string) {
		return this.prisma.room.delete({
			where: { id },
		});
	}
}
