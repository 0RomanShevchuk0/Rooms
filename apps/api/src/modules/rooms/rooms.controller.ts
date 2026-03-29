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
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';
import {
	toRoomParticipantPayload,
	toRoomWithParticipants,
	toRoomWithParticipantsAndChat,
} from './rooms.mapper';

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
		return rooms.map(toRoomWithParticipants);
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
		return toRoomWithParticipantsAndChat(room);
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
		return participant ? toRoomParticipantPayload(participant) : null;
	}

	@Post()
	async create(
		@Body(new ZodValidationPipe(CreateRoomPayloadSchema))
		createRoomDto: CreateRoomPayload,
	): Promise<RoomWithParticipants> {
		const room = await this.roomsService.create(createRoomDto);
		return toRoomWithParticipants(room);
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
		return toRoomWithParticipants(room);
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
		return toRoomWithParticipants(room);
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
		return toRoomWithParticipants(room);
	}
}
