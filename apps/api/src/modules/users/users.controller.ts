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
	type PublicUser as RestPublicUser,
	type UpdateUserPayload,
	type User as RestUser,
	type UserIdParams,
} from '@rooms/contracts/user';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';
import { toPublicRestUser, toRestUser } from './users.mapper';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
	constructor(private usersService: UsersService) {}

	@Get()
	async fetchUsers(): Promise<RestPublicUser[]> {
		const users = await this.usersService.findMany();
		return users.map(toPublicRestUser);
	}

	@Get('me')
	async getMe(@CurrentUser() user: AuthUser): Promise<RestUser> {
		const foundUser = await this.usersService.findByIdOrThrow(user.id);
		return toRestUser(foundUser);
	}

	@Get(':id')
	async findUser(
		@Param(new ZodValidationPipe(UserIdParamsSchema)) params: UserIdParams,
	): Promise<RestPublicUser> {
		const foundUser = await this.usersService.findByIdOrThrow(params.id);
		return toPublicRestUser(foundUser);
	}

	@Patch(':id')
	@UseGuards(SelfUserGuard)
	async updateUser(
		@Param(new ZodValidationPipe(UserIdParamsSchema)) params: UserIdParams,
		@Body(new ZodValidationPipe(UpdateUserPayloadSchema))
		body: UpdateUserPayload,
	): Promise<RestUser> {
		const updatedUser = await this.usersService.update(params.id, body);
		return toRestUser(updatedUser);
	}

	@Delete(':id')
	@UseGuards(SelfUserGuard)
	async deleteUser(
		@Param(new ZodValidationPipe(UserIdParamsSchema)) params: UserIdParams,
	): Promise<RestUser> {
		const deletedUser = await this.usersService.remove(params.id);
		return toRestUser(deletedUser);
	}
}
