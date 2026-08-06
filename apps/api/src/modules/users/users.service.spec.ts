import type { PrismaService } from 'src/database/prisma/prisma.service';
import { OAuthProvider } from 'generated/prisma/enums';
import { DOMAIN_ERROR_CODES } from 'src/shared/errors/domain.error';
import type { PasswordsService } from '../auth/passwords.service';
import { UsersService } from './users.service';

interface FakeUser {
	id: string;
	email: string | null;
	name: string | null;
	username: string;
	password?: string | null;
	deletedAt: Date | null;
}

interface FakeAccount {
	provider: OAuthProvider;
	oauthId: string;
	userId: string;
}

/** The OAuth paths mostly branch over existing rows, so this stands in for them. */
function createPrisma(users: FakeUser[] = [], accounts: FakeAccount[] = []) {
	const state = {
		users: [...users],
		accounts: [...accounts],
		createdUsers: 0,
	};

	const prisma = {
		user: {
			findUnique: ({ where }: { where: Record<string, string> }) =>
				Promise.resolve(
					state.users.find(
						(user) =>
							(where.id !== undefined && user.id === where.id) ||
							(where.email !== undefined &&
								user.email === where.email) ||
							(where.username !== undefined &&
								user.username === where.username),
					) ?? null,
				),
			create: ({
				data,
			}: {
				data: {
					email?: string;
					name?: string;
					username: string;
					oauthAccounts?: { create: Omit<FakeAccount, 'userId'> };
				};
			}) => {
				const user: FakeUser = {
					id: `user-${++state.createdUsers}`,
					email: data.email ?? null,
					name: data.name ?? null,
					username: data.username,
					deletedAt: null,
				};
				state.users.push(user);

				if (data.oauthAccounts) {
					state.accounts.push({
						...data.oauthAccounts.create,
						userId: user.id,
					});
				}

				return Promise.resolve(user);
			},
		},
		oAuthAccount: {
			findUnique: ({
				where,
			}: {
				where: { provider_oauthId: Omit<FakeAccount, 'userId'> };
			}) => {
				const { provider, oauthId } = where.provider_oauthId;
				const account = state.accounts.find(
					(item) => item.provider === provider && item.oauthId === oauthId,
				);

				if (!account) {
					return Promise.resolve(null);
				}

				return Promise.resolve({
					user: state.users.find((user) => user.id === account.userId),
				});
			},
			create: ({ data }: { data: FakeAccount }) => {
				state.accounts.push(data);

				return Promise.resolve({
					user: state.users.find((user) => user.id === data.userId),
				});
			},
		},
	};

	return { prisma: prisma as unknown as PrismaService, state };
}

function createService(users: FakeUser[] = [], accounts: FakeAccount[] = []) {
	const { prisma, state } = createPrisma(users, accounts);
	const passwords = {} as PasswordsService;

	return { service: new UsersService(prisma, passwords), state };
}

const GOOGLE_USER: FakeUser = {
	id: 'u1',
	email: 'me@gmail.com',
	name: 'Roman Shevchuk',
	username: 'Roman_Shevchuk',
	deletedAt: null,
};

const GOOGLE_ACCOUNT: FakeAccount = {
	provider: OAuthProvider.google,
	oauthId: 'g-1',
	userId: 'u1',
};

describe('UsersService.findOrCreateByOAuth', () => {
	it('returns the account a provider is already attached to', async () => {
		const { service, state } = createService([GOOGLE_USER], [GOOGLE_ACCOUNT]);

		const user = await service.findOrCreateByOAuth({
			provider: OAuthProvider.google,
			oauthId: 'g-1',
			email: 'me@gmail.com',
		});

		expect(user.id).toBe('u1');
		expect(state.createdUsers).toBe(0);
	});

	// A verified address we already know about belongs to the same person, and a
	// duplicate account could never be merged back.
	it('attaches a second provider to the account owning the email', async () => {
		const { service, state } = createService([GOOGLE_USER], [GOOGLE_ACCOUNT]);

		const user = await service.findOrCreateByOAuth({
			provider: OAuthProvider.discord,
			oauthId: 'd-1',
			email: 'me@gmail.com',
			name: 'Duuude',
		});

		expect(user.id).toBe('u1');
		expect(state.createdUsers).toBe(0);
		expect(state.accounts).toHaveLength(2);
	});

	it('is idempotent once a provider has been attached', async () => {
		const { service, state } = createService([GOOGLE_USER], [GOOGLE_ACCOUNT]);
		const args = {
			provider: OAuthProvider.discord,
			oauthId: 'd-1',
			email: 'me@gmail.com',
		};

		await service.findOrCreateByOAuth(args);
		await service.findOrCreateByOAuth(args);

		expect(state.accounts).toHaveLength(2);
	});

	// Callers withhold an unverified address, and without one we must not reach
	// into somebody else's account.
	it('creates a separate account when no email is supplied', async () => {
		const { service, state } = createService([GOOGLE_USER], [GOOGLE_ACCOUNT]);

		const user = await service.findOrCreateByOAuth({
			provider: OAuthProvider.discord,
			oauthId: 'd-2',
			name: 'Duuude',
		});

		expect(user.id).not.toBe('u1');
		expect(
			state.accounts.filter((account) => account.userId === 'u1'),
		).toHaveLength(1);
	});

	it('refuses to attach to a deleted account', async () => {
		const { service } = createService([
			{ ...GOOGLE_USER, deletedAt: new Date() },
		]);

		await expect(
			service.findOrCreateByOAuth({
				provider: OAuthProvider.google,
				oauthId: 'g-9',
				email: 'me@gmail.com',
			}),
		).rejects.toMatchObject({
			code: DOMAIN_ERROR_CODES.CONFLICT,
			metadata: { deleted: true },
		});
	});

	it('attaches to an account that was registered with a password', async () => {
		const { service } = createService([
			{
				id: 'local',
				email: 'me@gmail.com',
				name: null,
				username: 'localguy',
				password: 'hash',
				deletedAt: null,
			},
		]);

		const user = await service.findOrCreateByOAuth({
			provider: OAuthProvider.google,
			oauthId: 'g-5',
			email: 'me@gmail.com',
		});

		expect(user.id).toBe('local');
	});

	it('creates a fresh account for an unknown email', async () => {
		const { service, state } = createService();

		const user = await service.findOrCreateByOAuth({
			provider: OAuthProvider.google,
			oauthId: 'g-7',
			email: 'new@gmail.com',
			name: 'John Smith',
		});

		expect(state.createdUsers).toBe(1);
		expect(state.accounts).toEqual([
			{ provider: OAuthProvider.google, oauthId: 'g-7', userId: user.id },
		]);
	});
});

describe('UsersService username generation', () => {
	const createOauthUser = async (name?: string, existing: FakeUser[] = []) => {
		const { service } = createService(existing);

		const user = await service.findOrCreateByOAuth({
			provider: OAuthProvider.google,
			oauthId: `g-${Math.random()}`,
			name,
		});

		return user.username;
	};

	const taken = (username: string): FakeUser => ({
		id: username,
		email: null,
		name: null,
		username,
		deletedAt: null,
	});

	// The username is shown to everyone in a room; the email must never be it.
	it('never derives the username from the email', async () => {
		const { service } = createService();

		const user = await service.findOrCreateByOAuth({
			provider: OAuthProvider.google,
			oauthId: 'g-1',
			email: 'me@gmail.com',
			name: 'Roman Shevchuk',
		});

		expect(user.username).not.toContain('@');
		expect(user.username).toBe('Roman_Shevchuk');
	});

	it('disambiguates a name that is already taken', async () => {
		expect(await createOauthUser('John Smith', [taken('John_Smith')])).toBe(
			'John_Smith2',
		);
	});

	it('falls back to a random handle once the numbered variants run out', async () => {
		const existing = [
			taken('John_Smith'),
			taken('John_Smith2'),
			taken('John_Smith3'),
			taken('John_Smith4'),
			taken('John_Smith5'),
		];

		expect(await createOauthUser('John Smith', existing)).toMatch(
			/^John_Smith_[0-9a-f]{6}$/,
		);
	});

	it('falls back when the name survives no allowed characters', async () => {
		expect(await createOauthUser('Роман Шевчук')).toMatch(
			/^user_[0-9a-f]{6}$/,
		);
	});

	it('falls back when there is no name at all', async () => {
		expect(await createOauthUser()).toMatch(/^user_[0-9a-f]{6}$/);
	});

	it('keeps the username within the length the contract allows', async () => {
		const username = await createOauthUser('a'.repeat(60));

		expect(username).toHaveLength(24);
	});

	it('strips characters a username may not contain', async () => {
		expect(await createOauthUser('john+smith@work')).toBe('john_smith_work');
	});
});
