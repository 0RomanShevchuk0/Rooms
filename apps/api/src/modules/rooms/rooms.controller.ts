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

@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
	constructor(
		private readonly roomsService: RoomsService,
		private readonly roomsWsGateway: RoomsWsGateway,
	) {}

	@Get('my')
	findMy(@CurrentUser() user: AuthUser) {
		return this.roomsService.findMany({ userId: user.id });
	}

	@Get(':id')
	async findOne(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
		@CurrentUser() user: AuthUser,
	) {
		return this.roomsService.findByIdForUserOrThrow(id, user.id);
	}

	@Get(':id/participants/me')
	async findMyParticipant(
		@Param('id') id: string,
		@CurrentUser() user: AuthUser,
	) {
		return this.roomsService.findMyParticipant(id, user.id);
	}

	@Post()
	async create(@Body() createRoomDto: CreateRoomDto) {
		return this.roomsService.create(createRoomDto);
	}

	@Post(':id/participants')
	async join(@Param('id') id: string, @CurrentUser() user: AuthUser) {
		const { room, participant } = await this.roomsService.join(id, user.id);
		this.roomsWsGateway.notifyParticipantJoined(id, participant);
		return room;
	}

	@Patch(':id')
	async update(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
		@Body() updateRoomDto: UpdateRoomDto,
		@CurrentUser() user: AuthUser,
	) {
		return this.roomsService.update(id, user.id, updateRoomDto);
	}

	@Delete(':id/participants')
	async leave(@Param('id') id: string, @CurrentUser() user: AuthUser) {
		const { room, participant } = await this.roomsService.leave(id, user.id);
		this.roomsWsGateway.notifyParticipantLeft(id, participant);
		return room;
	}
}
