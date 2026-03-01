import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	NotFoundException,
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

	@Get()
	findAll() {
		return this.roomsService.findMany();
	}

	@Get('my')
	findMy(@CurrentUser() user: AuthUser) {
		return this.roomsService.findMany({ userId: user.id });
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		const room = await this.roomsService.findById(id);
		if (!room) {
			throw new NotFoundException(`Room "${id}" not found`);
		}
		return room;
	}

	@Post()
	create(@Body() createRoomDto: CreateRoomDto) {
		return this.roomsService.create(createRoomDto);
	}

	@Post(':id/members')
	async join(@Param('id') id: string, @CurrentUser() user: AuthUser) {
		const { room, player } = await this.roomsService.join(id, user.id);
		this.roomsWsGateway.notifyPlayerJoined(id, player);
		return room;
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
		return this.roomsService.update(id, updateRoomDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.roomsService.remove(id);
	}

	@Delete(':id/members')
	async leave(@Param('id') id: string, @CurrentUser() user: AuthUser) {
		const { room, player } = await this.roomsService.leave(id, user.id);
		this.roomsWsGateway.notifyPlayerLeft(id, player);
		return room;
	}
}
