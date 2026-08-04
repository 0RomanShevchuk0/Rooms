import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import type {
	CreateOauthUserInput,
	CreateUserInput,
} from './inputs/create-user.input';
import type { UpdateUserInput } from './inputs/update-user.input';
import { PasswordsService } from '../auth/passwords.service';
import { UserForAuth } from './types/user-for-auth.type';
import {
	publicUserSelect,
	userRecordSelect,
	type PublicUser,
	type UserRecord,
} from './users.select';
import { DomainError } from 'src/shared/errors/domain.error';
import { isUniqueConstraintError } from 'src/shared/errors/prisma-error';
import { OAuthProvider } from 'generated/prisma/enums';

const USERNAME_MIN_LENGTH = 3;
/** Leaves room for the disambiguating suffix within the 32 char limit. */
const USERNAME_BASE_MAX_LENGTH = 24;
const USERNAME_ATTEMPTS = 5;

@Injectable()
export class UsersService {
	constructor(
		private prisma: PrismaService,
		private passwordsService: PasswordsService,
	) {}

	async findById(id: string): Promise<UserRecord | null> {
		return this.prisma.user.findUnique({
			where: { id },
			select: userRecordSelect,
		});
	}

	async findByIdOrThrow(id: string): Promise<UserRecord> {
		const user = await this.findById(id);
		if (!user) {
			throw DomainError.notFound(`User "${id}" not found`, {
				entity: 'user',
				userId: id,
			});
		}
		return user;
	}

	async findByUsername(username: string): Promise<UserRecord | null> {
		return this.prisma.user.findUnique({
			where: { username },
			select: userRecordSelect,
		});
	}

	async findByEmail(email: string): Promise<UserRecord | null> {
		return this.prisma.user.findUnique({
			where: { email },
			select: userRecordSelect,
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

	async findOauthUser(
		provider: OAuthProvider,
		oauthId: string,
	): Promise<UserRecord | null> {
		const account = await this.prisma.oAuthAccount.findUnique({
			where: { provider_oauthId: { provider, oauthId } },
			select: { user: { select: userRecordSelect } },
		});

		return account?.user ?? null;
	}

	/** Which providers can already reach this account. */
	async findLinkedProviders(userId: string): Promise<OAuthProvider[]> {
		const accounts = await this.prisma.oAuthAccount.findMany({
			where: { userId },
			select: { provider: true },
		});

		return accounts.map((account) => account.provider);
	}

	/**
	 * Usernames are shown to everyone in a room, so an OAuth signup must never
	 * fall back to the email address.
	 */
	private async generateUsername(displayName?: string): Promise<string> {
		const base = toUsernameBase(displayName);

		for (let attempt = 0; attempt < USERNAME_ATTEMPTS; attempt++) {
			const candidate = attempt === 0 ? base : `${base}${attempt + 1}`;
			const taken = await this.findByUsername(candidate);
			if (!taken) {
				return candidate;
			}
		}

		return `${base}_${randomBytes(3).toString('hex')}`;
	}

	async createOauthUser(userData: CreateOauthUserInput): Promise<UserRecord> {
		const { oauthId, email, provider, name } = userData;
		return this.prisma.user.create({
			data: {
				email: email,
				name: name,
				username: await this.generateUsername(name),
				oauthAccounts: { create: { provider, oauthId } },
			},
			select: userRecordSelect,
		});
	}

	private async linkOauthAccount(
		userId: string,
		provider: OAuthProvider,
		oauthId: string,
	): Promise<UserRecord> {
		const account = await this.prisma.oAuthAccount.create({
			data: { provider, oauthId, userId },
			select: { user: { select: userRecordSelect } },
		});

		return account.user;
	}

	/**
	 * A verified email proves control of the mailbox, so a second provider
	 * reporting one we already know about is the same person — attach it to the
	 * existing account instead of leaving them locked out.
	 *
	 * Callers must only pass an email the provider marked as verified.
	 */
	async findOrCreateByOAuth(
		userData: CreateOauthUserInput,
	): Promise<UserRecord> {
		const { provider, oauthId, email, name } = userData;

		const linkedUser = await this.findOauthUser(provider, oauthId);
		if (linkedUser) {
			return linkedUser;
		}

		if (email) {
			const userWithSameEmail = await this.findByEmail(email);

			if (userWithSameEmail?.deletedAt) {
				throw DomainError.conflict('Account for this email was deleted', {
					field: 'email',
					deleted: true,
				});
			}

			if (userWithSameEmail) {
				return this.linkOauthAccount(
					userWithSameEmail.id,
					provider,
					oauthId,
				);
			}
		}

		try {
			return await this.createOauthUser({ provider, oauthId, email, name });
		} catch (error) {
			// A concurrent first sign-in may have claimed the same email or
			// username in between.
			if (isUniqueConstraintError(error)) {
				throw DomainError.conflict(
					'Account already exists for this email or username',
				);
			}
			throw error;
		}
	}

	async create(createUserDto: CreateUserInput): Promise<UserRecord> {
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
			select: userRecordSelect,
		});
	}

	async update(
		id: string,
		updateUserDto: UpdateUserInput,
	): Promise<UserRecord> {
		const hasUpdatableFields =
			updateUserDto.email !== undefined ||
			updateUserDto.name !== undefined ||
			updateUserDto.username !== undefined;
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

		if (updateUserDto.username !== undefined) {
			const userWithSameUsername = await this.findByUsername(
				updateUserDto.username,
			);
			if (userWithSameUsername && userWithSameUsername.id !== id) {
				throw DomainError.conflict('Username already exists', {
					field: 'username',
				});
			}
		}

		try {
			return await this.prisma.user.update({
				where: { id },
				data: {
					email: updateUserDto.email,
					name: updateUserDto.name,
					username: updateUserDto.username,
				},
				select: userRecordSelect,
			});
		} catch (error) {
			if (isUniqueConstraintError(error)) {
				throw DomainError.conflict('Email or username already exists');
			}
			throw error;
		}
	}

	async remove(id: string): Promise<UserRecord> {
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
			select: userRecordSelect,
		});
	}
}

function toUsernameBase(displayName?: string): string {
	const slug = (displayName ?? '')
		.normalize('NFKD')
		.replace(/[^a-zA-Z0-9._-]+/g, '_')
		.replace(/^[._-]+|[._-]+$/g, '')
		.slice(0, USERNAME_BASE_MAX_LENGTH);

	// Names that survive nothing of the allowed charset (e.g. fully non-latin)
	// still need a usable handle.
	return slug.length >= USERNAME_MIN_LENGTH
		? slug
		: `user_${randomBytes(3).toString('hex')}`;
}
