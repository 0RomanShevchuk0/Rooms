import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthUser } from '../auth/types/auth-user.type';
import { SelfUserGuard } from './guards/self-user.guard';
import type { User as RestUser } from '@rooms/contracts/user';
import type { PublicUserDto } from './dto/public-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get()
	async fetchUsers(): Promise<RestUser[]> {
		const users = await this.usersService.findMany();
		return users.map((user) => this.toRestUser(user));
	}

	@Get('me')
	async getMe(@CurrentUser() user: AuthUser): Promise<RestUser> {
		const foundUser = await this.usersService.findByIdOrThrow(user.id);
		return this.toRestUser(foundUser);
	}

	@Get(':id')
	async findUser(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
	): Promise<RestUser> {
		const foundUser = await this.usersService.findByIdOrThrow(id);
		return this.toRestUser(foundUser);
	}

	@Patch(':id')
	@UseGuards(SelfUserGuard)
	async updateUser(
		@Param('id') id: string,
		@Body() body: UpdateUserDto,
	): Promise<RestUser> {
		const updatedUser = await this.usersService.update(id, body);
		return this.toRestUser(updatedUser);
	}

	@Delete(':id')
	@UseGuards(SelfUserGuard)
	async deleteUser(@Param('id') id: string): Promise<RestUser> {
		const deletedUser = await this.usersService.remove(id);
		return this.toRestUser(deletedUser);
	}

	private toRestUser(user: PublicUserDto): RestUser {
		return {
			id: user.id,
			username: user.username,
			email: user.email,
			name: user.name,
			deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
		};
	}
}
