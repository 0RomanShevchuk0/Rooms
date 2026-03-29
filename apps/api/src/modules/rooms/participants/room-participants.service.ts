import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import type { CreateRoomParticipantInput } from './inputs/create-room-participant.input';
import type { UpdateRoomParticipantInput } from './inputs/update-room-participant.input';
import {
	RoomParticipantWithUser,
	roomParticipantWithUserSelect,
} from './room-participants.select';

@Injectable()
export class RoomParticipantsService {
	constructor(private prisma: PrismaService) {}

	create(
		createRoomParticipantDto: CreateRoomParticipantInput,
	): Promise<RoomParticipantWithUser> {
		return this.prisma.roomParticipant.create({
			data: {
				roomId: createRoomParticipantDto.roomId,
				userId: createRoomParticipantDto.userId,
				isReady: createRoomParticipantDto.isReady ?? false,
			},
			select: roomParticipantWithUserSelect,
		});
	}

	findAll(): Promise<RoomParticipantWithUser[]> {
		return this.prisma.roomParticipant.findMany({
			select: roomParticipantWithUserSelect,
		});
	}

	findOne(id: string): Promise<RoomParticipantWithUser | null> {
		return this.prisma.roomParticipant.findUnique({
			where: { id },
			select: roomParticipantWithUserSelect,
		});
	}

	update(
		id: string,
		updateRoomParticipantDto: UpdateRoomParticipantInput,
	): Promise<RoomParticipantWithUser> {
		return this.prisma.roomParticipant.update({
			where: { id },
			data: updateRoomParticipantDto,
			select: roomParticipantWithUserSelect,
		});
	}

	remove(id: string) {
		return this.prisma.roomParticipant.delete({
			where: { id },
		});
	}

	removeByRoomAndUser(
		roomId: string,
		userId: string,
	): Promise<RoomParticipantWithUser> {
		return this.prisma.roomParticipant.delete({
			where: { roomId_userId: { roomId, userId } },
			select: roomParticipantWithUserSelect,
		});
	}

	findByRoomAndUser(
		roomId: string,
		userId: string,
	): Promise<RoomParticipantWithUser | null> {
		return this.prisma.roomParticipant.findUnique({
			where: { roomId_userId: { roomId, userId } },
			select: roomParticipantWithUserSelect,
		});
	}

	setReady(
		roomId: string,
		userId: string,
		isReady: boolean,
	): Promise<RoomParticipantWithUser> {
		return this.prisma.roomParticipant.update({
			where: {
				roomId_userId: {
					roomId,
					userId,
				},
			},
			data: { isReady },
			select: roomParticipantWithUserSelect,
		});
	}

	async isUserParticipantInRoom(
		roomId: string,
		participantId: string,
		userId: string,
	): Promise<boolean> {
		const participant = await this.prisma.roomParticipant.findFirst({
			where: { id: participantId, roomId, userId },
			select: { id: true },
		});
		return Boolean(participant);
	}
}
