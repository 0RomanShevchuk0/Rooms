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
		return this.usersService.findByIdOrThrow(user.id);
	}

	@Get(':id')
	async findUser(
		@Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
	) {
		return this.usersService.findByIdOrThrow(id);
	}

	@Patch(':id')
	@UseGuards(SelfUserGuard)
	async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
		return this.usersService.update(id, body);
	}

	@Delete(':id')
	@UseGuards(SelfUserGuard)
	async deleteUser(@Param('id') id: string) {
		return this.usersService.remove(id);
	}
}
