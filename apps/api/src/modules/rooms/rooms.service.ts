import { Injectable } from '@nestjs/common';
import type { CreateRoomInput } from './inputs/create-room.input';
import type { UpdateRoomInput } from './inputs/update-room.input';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Room } from 'generated/prisma/client';
import {
	RoomJoinLeaveResult,
	RoomWithParticipants,
	RoomWithParticipantsAndChat,
} from './rooms.types';
import { DEFAULT_SNAKE_GAME_SETTINGS } from './room-settings/room-settings.constants';
import {
	roomParticipantWithUserSelect,
	type RoomParticipantWithUser,
} from './participants/room-participants.select';
import { RoomParticipantsService } from './participants/room-participants.service';
import { RoomPresenceService } from './presence/room-presence.service';
import { DomainError } from 'src/shared/errors/domain.error';

@Injectable()
export class RoomsService {
	constructor(
		private prisma: PrismaService,
		private readonly participantsService: RoomParticipantsService,
		private readonly presenceService: RoomPresenceService,
	) {}

	findMany(filters?: { userId?: string }): Promise<RoomWithParticipants[]> {
		return this.prisma.room.findMany({
			where: {
				...(filters?.userId && {
					participants: { some: { userId: filters.userId } },
				}),
			},
			include: { participants: { select: roomParticipantWithUserSelect } },
		});
	}

	findById(id: string): Promise<RoomWithParticipantsAndChat | null> {
		return this.prisma.room.findUnique({
			where: { id },
			include: {
				participants: { select: roomParticipantWithUserSelect },
				chat: true,
				snakeSettings: true,
			},
		});
	}

	async findByIdForUserOrThrow(
		id: string,
		userId: string,
	): Promise<RoomWithParticipantsAndChat> {
		const room = await this.findByIdOrThrow(id);
		const isParticipant = room.participants.some(
			(participant) => participant.userId === userId,
		);

		if (!isParticipant) {
			throw DomainError.accessDenied(
				'You are not a participant of this room',
				{
					entity: 'room',
					roomId: id,
					userId,
				},
			);
		}

		return room;
	}

	async getRoomParticipants(
		roomId: string,
	): Promise<RoomParticipantWithUser[]> {
		await this.findByIdOrThrow(roomId);
		return this.participantsService.findByRoom(roomId);
	}

	async getReadyParticipantIds(roomId: string): Promise<string[]> {
		await this.findByIdOrThrow(roomId);

		const online = new Set(
			this.presenceService.getOnlineParticipantIds(roomId),
		);
		const readyIds =
			await this.participantsService.findReadyIdsByRoom(roomId);

		return readyIds.filter((participantId) => online.has(participantId));
	}

	async findMyParticipant(roomId: string, userId: string) {
		await this.findByIdOrThrow(roomId);
		return this.participantsService.findByRoomAndUser(roomId, userId);
	}

	async create(
		createRoomDto: CreateRoomInput,
	): Promise<RoomWithParticipantsAndChat> {
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

			throw DomainError.validation('Some users were not found', {
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
				snakeSettings: {
					create: {
						fieldWidth: DEFAULT_SNAKE_GAME_SETTINGS.fieldSize.width,
						fieldHeight: DEFAULT_SNAKE_GAME_SETTINGS.fieldSize.height,
						foodAmount: DEFAULT_SNAKE_GAME_SETTINGS.foodAmount,
					},
				},
			},
			include: {
				participants: { select: roomParticipantWithUserSelect },
				chat: true,
				snakeSettings: true,
			},
		});
	}

	async join(id: string, userId: string): Promise<RoomJoinLeaveResult> {
		await this.findByIdOrThrow(id);

		const participant = await this.participantsService.create({
			roomId: id,
			userId,
		});

		const updatedRoom = await this.findByIdOrThrow(id);

		return { room: updatedRoom, participant };
	}

	async leave(id: string, userId: string): Promise<RoomJoinLeaveResult> {
		await this.findByIdOrThrow(id);

		const deletedParticipant =
			await this.participantsService.removeByRoomAndUser(id, userId);

		const updatedRoom = await this.findByIdOrThrow(id);

		return { room: updatedRoom, participant: deletedParticipant };
	}

	async update(
		id: string,
		userId: string,
		updateRoomDto: UpdateRoomInput,
	): Promise<RoomWithParticipants> {
		await this.findByIdForUserOrThrow(id, userId);

		return this.prisma.room.update({
			where: { id },
			data: updateRoomDto,
			include: { participants: { select: roomParticipantWithUserSelect } },
		});
	}

	remove(id: string): Promise<Room> {
		return this.prisma.room.delete({
			where: { id },
		});
	}

	private async findByIdOrThrow(
		id: string,
	): Promise<RoomWithParticipantsAndChat> {
		const room = await this.findById(id);
		if (!room) {
			throw DomainError.notFound(`Room "${id}" not found`, {
				entity: 'room',
				roomId: id,
			});
		}
		return room;
	}
}
