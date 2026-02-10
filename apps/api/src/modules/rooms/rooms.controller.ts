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
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rooms')
export class RoomsController {
	constructor(private readonly roomsService: RoomsService) {}

	@Post()
	create(@Body() createRoomDto: CreateRoomDto) {
		return this.roomsService.create(createRoomDto);
	}

	@UseGuards(JwtAuthGuard)
	@Get()
	findAll() {
		return this.roomsService.findMany();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.roomsService.findById(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
		return this.roomsService.update(id, updateRoomDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.roomsService.remove(id);
	}
}
