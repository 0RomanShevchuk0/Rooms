import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	ParseUUIDPipe,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthUser } from '../auth/types/auth-user.type';
import { RoomsWsGateway } from './ws/rooms-ws.gateway';
import type {
	RoomParticipant,
	RoomWithParticipants,
	RoomWithParticipantsAndChat,
} from '@rooms/contracts/room';
import type {
	RoomWithParticipants as RoomWithParticipantsEntity,
	RoomWithParticipantsAndChat as RoomWithParticipantsAndChatEntity,
} from './rooms.types';
import type { RoomParticipantWithUser } from './participants/room-participants.select';
import { DomainError } from 'src/shared/errors/domain.error';

@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
	constructor(
		private readonly roomsService: RoomsService,
		private readonly roomsWsGateway: RoomsWsGateway,
	) {}

	@Get('my')
	async findMy(
		@CurrentUser() user: AuthUser,
	): Promise<RoomWithParticipants[]> {
		const rooms = await this.roomsService.findMany({ userId: user.id });
		return rooms.map((room) => this.toRoomWithParticipants(room));
	}

	@Get(':id')
	async findOne(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
		@CurrentUser() user: AuthUser,
	): Promise<RoomWithParticipantsAndChat> {
		const room = await this.roomsService.findByIdForUserOrThrow(id, user.id);
		return this.toRoomWithParticipantsAndChat(room);
	}

	@Get(':id/participants/me')
	async findMyParticipant(
		@Param('id') id: string,
		@CurrentUser() user: AuthUser,
	): Promise<RoomParticipant | null> {
		const participant = await this.roomsService.findMyParticipant(
			id,
			user.id,
		);
		return participant ? this.toRoomParticipant(participant) : null;
	}

	@Post()
	async create(
		@Body() createRoomDto: CreateRoomDto,
	): Promise<RoomWithParticipants> {
		const room = await this.roomsService.create(createRoomDto);
		return this.toRoomWithParticipants(room);
	}

	@Post(':id/participants')
	async join(
		@Param('id') id: string,
		@CurrentUser() user: AuthUser,
	): Promise<RoomWithParticipants> {
		const { room, participant } = await this.roomsService.join(id, user.id);
		this.roomsWsGateway.notifyParticipantJoined(id, participant);
		return this.toRoomWithParticipants(room);
	}

	@Patch(':id')
	async update(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
		@Body() updateRoomDto: UpdateRoomDto,
		@CurrentUser() user: AuthUser,
	): Promise<RoomWithParticipants> {
		const room = await this.roomsService.update(id, user.id, updateRoomDto);
		return this.toRoomWithParticipants(room);
	}

	@Delete(':id/participants')
	async leave(
		@Param('id') id: string,
		@CurrentUser() user: AuthUser,
	): Promise<RoomWithParticipants> {
		const { room, participant } = await this.roomsService.leave(id, user.id);
		this.roomsWsGateway.notifyParticipantLeft(id, participant);
		return this.toRoomWithParticipants(room);
	}

	private toRoomParticipant(
		participant: RoomParticipantWithUser,
	): RoomParticipant {
		return {
			id: participant.id,
			isReady: participant.isReady,
			userId: participant.userId,
			user: {
				id: participant.user.id,
				username: participant.user.username,
				email: participant.user.email,
				name: participant.user.name,
				deletedAt: participant.user.deletedAt
					? participant.user.deletedAt.toISOString()
					: null,
			},
		};
	}

	private toRoomWithParticipants(
		room: RoomWithParticipantsEntity | RoomWithParticipantsAndChatEntity,
	): RoomWithParticipants {
		return {
			id: room.id,
			name: room.name,
			description: room.description,
			participants: room.participants.map((participant) =>
				this.toRoomParticipant(participant),
			),
		};
	}

	private toRoomWithParticipantsAndChat(
		room: RoomWithParticipantsAndChatEntity,
	): RoomWithParticipantsAndChat {
		if (!room.chat) {
			throw DomainError.notFound(`Chat for room "${room.id}" not found`, {
				entity: 'chat',
				roomId: room.id,
			});
		}

		return {
			...this.toRoomWithParticipants(room),
			chat: {
				id: room.chat.id,
				roomId: room.chat.roomId,
				createdAt: room.chat.createdAt.toISOString(),
			},
		};
	}
}
