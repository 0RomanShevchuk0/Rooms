import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from 'generated/prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordsService } from '../auth/passwords.service';
import { PublicUserDto } from './dto/public-user.dto';
import { UserForAuth } from './types/user-for-auth.type';

@Injectable()
export class UsersService {
	constructor(
		private prisma: PrismaService,
		private passwordsService: PasswordsService,
	) {}

	private userSelect = {
		id: true,
		name: true,
		email: true,
		username: true,
		deletedAt: true,
	};

	async findById(id: string): Promise<PublicUserDto | null> {
		return this.prisma.user.findUnique({
			where: { id },
			select: this.userSelect,
		});
	}

	async findByUsername(username: string): Promise<PublicUserDto | null> {
		return this.prisma.user.findUnique({
			where: { username },
			select: this.userSelect,
		});
	}

	async findByEmail(email: string): Promise<PublicUserDto | null> {
		return this.prisma.user.findUnique({
			where: { email },
			select: this.userSelect,
		});
	}

	findByUsernameForAuth(username: string): Promise<UserForAuth | null> {
		return this.prisma.user.findUnique({
			where: { username },
			select: {
				id: true,
				username: true,
				password: true,
			},
		});
	}

	async findMany(): Promise<PublicUserDto[]> {
		return this.prisma.user.findMany({
			select: this.userSelect,
		});
	}

	async create(createUserDto: CreateUserDto): Promise<PublicUserDto> {
		const existingUser = await this.findByUsername(createUserDto.username);
		if (existingUser) {
			throw new BadRequestException('Username already exists');
		}

		const passwordHash = await this.passwordsService.hashPassword(
			createUserDto.password,
		);

		return this.prisma.user.create({
			data: {
				username: createUserDto.username,
				password: passwordHash,
			},
			select: this.userSelect,
		});
	}

	async update(
		id: string,
		updateUserDto: UpdateUserDto,
	): Promise<PublicUserDto> {
		return this.prisma.user.update({
			where: { id },
			data: {
				email: updateUserDto.email,
				name: updateUserDto.name,
			},
			select: this.userSelect,
		});
	}

	async remove(id: string): Promise<PublicUserDto> {
		return this.prisma.user.update({
			where: { id },
			data: {
				deletedAt: new Date(),
			},
			select: this.userSelect,
		});
	}
}
