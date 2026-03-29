import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthUser } from '../auth/types/auth-user.type';
import { RoomsWsGateway } from './ws/rooms-ws.gateway';
import {
	CreateRoomPayloadSchema,
	RoomIdParamsSchema,
	UpdateRoomPayloadSchema,
	type CreateRoomPayload,
	type RoomIdParams,
	type RoomParticipant,
	type RoomWithParticipants,
	type RoomWithParticipantsAndChat,
	type UpdateRoomPayload,
} from '@rooms/contracts/room';
import type {
	RoomWithParticipants as RoomWithParticipantsEntity,
	RoomWithParticipantsAndChat as RoomWithParticipantsAndChatEntity,
} from './rooms.types';
import type { RoomParticipantWithUser } from './participants/room-participants.select';
import { DomainError } from 'src/shared/errors/domain.error';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';

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
		@Param(new ZodValidationPipe(RoomIdParamsSchema)) params: RoomIdParams,
		@CurrentUser() user: AuthUser,
	): Promise<RoomWithParticipantsAndChat> {
		const room = await this.roomsService.findByIdForUserOrThrow(
			params.id,
			user.id,
		);
		return this.toRoomWithParticipantsAndChat(room);
	}

	@Get(':id/participants/me')
	async findMyParticipant(
		@Param(new ZodValidationPipe(RoomIdParamsSchema)) params: RoomIdParams,
		@CurrentUser() user: AuthUser,
	): Promise<RoomParticipant | null> {
		const participant = await this.roomsService.findMyParticipant(
			params.id,
			user.id,
		);
		return participant ? this.toRoomParticipant(participant) : null;
	}

	@Post()
	async create(
		@Body(new ZodValidationPipe(CreateRoomPayloadSchema))
		createRoomDto: CreateRoomPayload,
	): Promise<RoomWithParticipants> {
		const room = await this.roomsService.create(createRoomDto);
		return this.toRoomWithParticipants(room);
	}

	@Post(':id/participants')
	async join(
		@Param(new ZodValidationPipe(RoomIdParamsSchema)) params: RoomIdParams,
		@CurrentUser() user: AuthUser,
	): Promise<RoomWithParticipants> {
		const { room, participant } = await this.roomsService.join(
			params.id,
			user.id,
		);
		this.roomsWsGateway.notifyParticipantJoined(params.id, participant);
		return this.toRoomWithParticipants(room);
	}

	@Patch(':id')
	async update(
		@Param(new ZodValidationPipe(RoomIdParamsSchema)) params: RoomIdParams,
		@Body(new ZodValidationPipe(UpdateRoomPayloadSchema))
		updateRoomDto: UpdateRoomPayload,
		@CurrentUser() user: AuthUser,
	): Promise<RoomWithParticipants> {
		const room = await this.roomsService.update(
			params.id,
			user.id,
			updateRoomDto,
		);
		return this.toRoomWithParticipants(room);
	}

	@Delete(':id/participants')
	async leave(
		@Param(new ZodValidationPipe(RoomIdParamsSchema)) params: RoomIdParams,
		@CurrentUser() user: AuthUser,
	): Promise<RoomWithParticipants> {
		const { room, participant } = await this.roomsService.leave(
			params.id,
			user.id,
		);
		this.roomsWsGateway.notifyParticipantLeft(params.id, participant);
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
