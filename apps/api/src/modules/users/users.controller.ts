import {
	Body,
	Controller,
	Delete,
	Get,
	NotFoundException,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthUser } from '../auth/types/auth-user.type';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get()
	async fetchUsers() {
		return this.usersService.findMany();
	}

	@Get('me')
	async getMe(@CurrentUser() user: AuthUser) {
		const foundUser = await this.usersService.findById(user.id);
		if (!foundUser) {
			throw new NotFoundException('User not found');
		}
		return foundUser;
	}

	@Get(':id')
	async findUser(@Param('id') id: string) {
		const foundUser = await this.usersService.findById(id);
		if (!foundUser) {
			throw new NotFoundException(`User "${id}" not found`);
		}
		return foundUser;
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
