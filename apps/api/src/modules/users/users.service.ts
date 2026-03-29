import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import type { CreateUserInput } from './inputs/create-user.input';
import type { UpdateUserInput } from './inputs/update-user.input';
import { PasswordsService } from '../auth/passwords.service';
import { UserForAuth } from './types/user-for-auth.type';
import { publicUserSelect, type PublicUser } from './users.select';
import { DomainError } from 'src/shared/errors/domain.error';

@Injectable()
export class UsersService {
	constructor(
		private prisma: PrismaService,
		private passwordsService: PasswordsService,
	) {}

	async findById(id: string): Promise<PublicUser | null> {
		return this.prisma.user.findUnique({
			where: { id },
			select: publicUserSelect,
		});
	}

	async findByIdOrThrow(id: string): Promise<PublicUser> {
		const user = await this.findById(id);
		if (!user) {
			throw DomainError.notFound(`User "${id}" not found`, {
				entity: 'user',
				userId: id,
			});
		}
		return user;
	}

	async findByUsername(username: string): Promise<PublicUser | null> {
		return this.prisma.user.findUnique({
			where: { username },
			select: publicUserSelect,
		});
	}

	async findByEmail(email: string): Promise<PublicUser | null> {
		return this.prisma.user.findUnique({
			where: { email },
			select: publicUserSelect,
		});
	}

	findByUsernameForAuth(username: string): Promise<UserForAuth | null> {
		return this.prisma.user.findUnique({
			where: { username },
			select: {
				id: true,
				username: true,
				password: true,
				deletedAt: true,
			},
		});
	}

	async findMany(): Promise<PublicUser[]> {
		return this.prisma.user.findMany({
			select: publicUserSelect,
		});
	}

	async create(createUserDto: CreateUserInput): Promise<PublicUser> {
		const existingUser = await this.findByUsername(createUserDto.username);
		if (existingUser) {
			throw DomainError.validation('Username already exists', {
				field: 'username',
			});
		}

		const passwordHash = await this.passwordsService.hashPassword(
			createUserDto.password,
		);

		return this.prisma.user.create({
			data: {
				username: createUserDto.username,
				password: passwordHash,
			},
			select: publicUserSelect,
		});
	}

	async update(
		id: string,
		updateUserDto: UpdateUserInput,
	): Promise<PublicUser> {
		const hasUpdatableFields =
			updateUserDto.email !== undefined || updateUserDto.name !== undefined;
		if (!hasUpdatableFields) {
			throw DomainError.validation('At least one field must be provided');
		}

		const existingUser = await this.findByIdOrThrow(id);

		if (existingUser.deletedAt) {
			throw DomainError.validation('Deleted user cannot be updated', {
				userId: id,
			});
		}

		if (updateUserDto.email !== undefined && updateUserDto.email !== null) {
			const userWithSameEmail = await this.findByEmail(updateUserDto.email);
			if (userWithSameEmail && userWithSameEmail.id !== id) {
				throw DomainError.validation('Email already exists', {
					field: 'email',
				});
			}
		}

		return this.prisma.user.update({
			where: { id },
			data: {
				email: updateUserDto.email,
				name: updateUserDto.name,
			},
			select: publicUserSelect,
		});
	}

	async remove(id: string): Promise<PublicUser> {
		const existingUser = await this.findByIdOrThrow(id);

		if (existingUser.deletedAt) {
			throw DomainError.validation('User is already deleted', {
				userId: id,
			});
		}

		return this.prisma.user.update({
			where: { id },
			data: {
				deletedAt: new Date(),
			},
			select: publicUserSelect,
		});
	}
}
