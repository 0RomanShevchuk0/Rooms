import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get()
	async fetchUsers() {
		return this.usersService.findMany();
	}

	@Get(':id')
	findUser(@Param('id') id: string) {
		return this.usersService.findById(id);
	}

	@Post()
	async createUser(@Body() body: CreateUserDto) {
		return this.usersService.create(body);
	}

	@Patch(':id')
	async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
		return this.usersService.update(id, body);
	}

	@Delete(':id')
	async deleteUser(@Param('id') id: string) {
		return this.usersService.remove(id);
	}
}
