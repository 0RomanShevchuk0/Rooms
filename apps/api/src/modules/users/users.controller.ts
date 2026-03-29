import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthUser } from '../auth/types/auth-user.type';
import { SelfUserGuard } from './guards/self-user.guard';
import {
	UpdateUserPayloadSchema,
	UserIdParamsSchema,
	type UpdateUserPayload,
	type User as RestUser,
	type UserIdParams,
} from '@rooms/contracts/user';
import type { PublicUser } from './users.select';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';

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
		@Param(new ZodValidationPipe(UserIdParamsSchema)) params: UserIdParams,
	): Promise<RestUser> {
		const foundUser = await this.usersService.findByIdOrThrow(params.id);
		return this.toRestUser(foundUser);
	}

	@Patch(':id')
	@UseGuards(SelfUserGuard)
	async updateUser(
		@Param(new ZodValidationPipe(UserIdParamsSchema)) params: UserIdParams,
		@Body(new ZodValidationPipe(UpdateUserPayloadSchema))
		body: UpdateUserPayload,
	): Promise<RestUser> {
		const updatedUser = await this.usersService.update(params.id, body);
		return this.toRestUser(updatedUser);
	}

	@Delete(':id')
	@UseGuards(SelfUserGuard)
	async deleteUser(
		@Param(new ZodValidationPipe(UserIdParamsSchema)) params: UserIdParams,
	): Promise<RestUser> {
		const deletedUser = await this.usersService.remove(params.id);
		return this.toRestUser(deletedUser);
	}

	private toRestUser(user: PublicUser): RestUser {
		return {
			id: user.id,
			username: user.username,
			email: user.email,
			name: user.name,
			deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
		};
	}
}
