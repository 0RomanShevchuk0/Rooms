import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get()
	async fetchUsers() {
		return this.usersService.queryUsers();
	}

	@Get(':id')
	findUser(@Param('id') id: string) {
		return this.usersService.findUser(id);
	}

	@Post()
	async createUser(@Body() body: CreateUserDto) {
		return this.usersService.createUser(body);
	}

	@Patch(':id')
	async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
		return this.usersService.updateUser(id, body);
	}

	@Delete(':id')
	async deleteUser(@Param('id') id: string) {
		return this.usersService.deleteUser(id);
	}
}
