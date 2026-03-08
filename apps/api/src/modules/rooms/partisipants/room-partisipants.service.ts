import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateRoomPartisipantDto } from './dto/create-room-partisipant.dto';
import { UpdateRoomPartisipantDto } from './dto/update-room-partisipant.dto';
import {
	RoomPartisipantWithUser,
	roomPartisipantWithUserSelect,
} from './room-partisipants.select';

@Injectable()
export class RoomPartisipantsService {
	constructor(private prisma: PrismaService) {}

	create(
		createRoomPartisipantDto: CreateRoomPartisipantDto,
	): Promise<RoomPartisipantWithUser> {
		return this.prisma.roomParticipant.create({
			data: {
				roomId: createRoomPartisipantDto.roomId,
				userId: createRoomPartisipantDto.userId,
				isReady: createRoomPartisipantDto.isReady ?? false,
			},
			select: roomPartisipantWithUserSelect,
		});
	}

	findAll(): Promise<RoomPartisipantWithUser[]> {
		return this.prisma.roomParticipant.findMany({
			select: roomPartisipantWithUserSelect,
		});
	}

	findOne(id: string): Promise<RoomPartisipantWithUser | null> {
		return this.prisma.roomParticipant.findUnique({
			where: { id },
			select: roomPartisipantWithUserSelect,
		});
	}

	update(
		id: string,
		updateRoomPartisipantDto: UpdateRoomPartisipantDto,
	): Promise<RoomPartisipantWithUser> {
		return this.prisma.roomParticipant.update({
			where: { id },
			data: updateRoomPartisipantDto,
			select: roomPartisipantWithUserSelect,
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
	): Promise<RoomPartisipantWithUser> {
		return this.prisma.roomParticipant.delete({
			where: { roomId_userId: { roomId, userId } },
			select: roomPartisipantWithUserSelect,
		});
	}

	findByRoomAndUser(
		roomId: string,
		userId: string,
	): Promise<RoomPartisipantWithUser | null> {
		return this.prisma.roomParticipant.findUnique({
			where: { roomId_userId: { roomId, userId } },
			select: roomPartisipantWithUserSelect,
		});
	}

	setReady(
		roomId: string,
		userId: string,
		isReady: boolean,
	): Promise<RoomPartisipantWithUser> {
		return this.prisma.roomParticipant.update({
			where: {
				roomId_userId: {
					roomId,
					userId,
				},
			},
			data: { isReady },
			select: roomPartisipantWithUserSelect,
		});
	}
}
