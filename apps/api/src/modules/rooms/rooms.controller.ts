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

@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
	constructor(private readonly roomsService: RoomsService) {}

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
	join(@Param('id') id: string, @CurrentUser() user: AuthUser) {
		return this.roomsService.join(id, user.id);
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
	leave(@Param('id') id: string, @CurrentUser() user: AuthUser) {
		return this.roomsService.leave(id, user.id);
	}
}
