import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordsService } from '../auth/passwords.service';
import { PublicUserDto } from './dto/public-user.dto';
import { UserForAuth } from './types/user-for-auth.type';
import { publicUserSelect } from './users.select';
import { DomainError } from 'src/shared/errors/domain.error';

@Injectable()
export class UsersService {
	constructor(
		private prisma: PrismaService,
		private passwordsService: PasswordsService,
	) {}

	async findById(id: string): Promise<PublicUserDto | null> {
		return this.prisma.user.findUnique({
			where: { id },
			select: publicUserSelect,
		});
	}

	async findByIdOrThrow(id: string): Promise<PublicUserDto> {
		const user = await this.findById(id);
		if (!user) {
			throw DomainError.notFound(`User "${id}" not found`, {
				entity: 'user',
				userId: id,
			});
		}
		return user;
	}

	async findByUsername(username: string): Promise<PublicUserDto | null> {
		return this.prisma.user.findUnique({
			where: { username },
			select: publicUserSelect,
		});
	}

	async findByEmail(email: string): Promise<PublicUserDto | null> {
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

	async findMany(): Promise<PublicUserDto[]> {
		return this.prisma.user.findMany({
			select: publicUserSelect,
		});
	}

	async create(createUserDto: CreateUserDto): Promise<PublicUserDto> {
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
		updateUserDto: UpdateUserDto,
	): Promise<PublicUserDto> {
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

	async remove(id: string): Promise<PublicUserDto> {
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
