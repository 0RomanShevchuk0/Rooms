import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PasswordsService } from './passwords.service';
import { AuthUser } from './types/auth-user.type';
import { JwtPayload } from './types/jwt-payload.type';
import { DomainError } from 'src/shared/errors/domain.error';
import type { AuthCredentialsInput } from './inputs/auth-credentials.input';
import { randomBytes } from 'node:crypto';
import { OAuthProvider } from 'generated/prisma/enums';
import { DiscordTokenResponse, DiscordUser } from './types/discord-oauth.type';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly passwordsService: PasswordsService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
	) {}

	private async createTokens(payload: JwtPayload) {
		const accessSecret = this.configService.getOrThrow<string>('JWT_SECRET');
		const refreshSecret =
			this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(payload, {
				secret: accessSecret,
				expiresIn: '2h',
			}),
			this.jwtService.signAsync(payload, {
				secret: refreshSecret,
				expiresIn: '7d',
			}),
		]);

		return { access_token: accessToken, refresh_token: refreshToken };
	}

	async login(user: AuthUser) {
		const payload: JwtPayload = {
			sub: user.id,
			username: user.username,
		};

		const { access_token, refresh_token } = await this.createTokens(payload);
		return { access_token, refresh_token };
	}

	async register(authDto: AuthCredentialsInput) {
		const existingUser = await this.usersService.findByUsername(
			authDto.username,
		);

		if (existingUser) {
			throw DomainError.conflict('Username already exists', {
				field: 'username',
			});
		}

		const newUser = await this.usersService.create({
			username: authDto.username,
			password: authDto.password,
		});

		const payload: JwtPayload = {
			sub: newUser.id,
			username: newUser.username,
		};

		const { access_token, refresh_token } = await this.createTokens(payload);

		return { access_token, refresh_token };
	}

	async validateUser(
		username: string,
		password: string,
	): Promise<AuthUser | null> {
		const user = await this.usersService.findByUsernameForAuth(username);

		if (!user || user.deletedAt || !user.password) {
			return null;
		}

		const isPasswordValid = await this.passwordsService.validatePassword(
			password,
			user.password,
		);

		if (!isPasswordValid) {
			return null;
		}

		return {
			id: user.id,
			username: user.username,
		};
	}

	verifyAccessToken(token: string): JwtPayload | null {
		try {
			const accessSecret =
				this.configService.getOrThrow<string>('JWT_SECRET');
			return this.jwtService.verify<JwtPayload>(token, {
				secret: accessSecret,
			});
		} catch {
			return null;
		}
	}

	verifyRefreshToken(token: string): JwtPayload | null {
		try {
			const refreshSecret =
				this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
			return this.jwtService.verify<JwtPayload>(token, {
				secret: refreshSecret,
			});
		} catch {
			return null;
		}
	}

	async refreshTokens(refreshToken: string) {
		const payload = this.verifyRefreshToken(refreshToken);
		if (!payload) {
			return null;
		}

		const { access_token, refresh_token } = await this.createTokens({
			sub: payload.sub,
			username: payload.username,
		});

		return { access_token, refresh_token };
	}

	getDiscordAuthorizationUrl() {
		const clientId =
			this.configService.getOrThrow<string>('DISCORD_CLIENT_ID');

		const redirectUri = this.configService.getOrThrow<string>(
			'DISCORD_CALLBACK_URL',
		);

		const state = randomBytes(32).toString('hex');

		const params = new URLSearchParams({
			response_type: 'code',
			client_id: clientId,
			scope: 'identify email',
			state,
			redirect_uri: redirectUri,
			prompt: 'consent',
		});

		const url = `https://discord.com/oauth2/authorize?${params.toString()}`;

		return {
			url,
			state,
		};
	}

	private async getDiscordUser(accessToken: string): Promise<DiscordUser> {
		const response = await fetch('https://discord.com/api/v10/users/@me', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			throw new UnauthorizedException('Failed to fetch Discord user');
		}

		return (await response.json()) as DiscordUser;
	}

	private async exchangeDiscordCode(
		code: string,
	): Promise<DiscordTokenResponse> {
		const clientId =
			this.configService.getOrThrow<string>('DISCORD_CLIENT_ID');

		const clientSecret = this.configService.getOrThrow<string>(
			'DISCORD_CLIENT_SECRET',
		);

		const redirectUri = this.configService.getOrThrow<string>(
			'DISCORD_CALLBACK_URL',
		);

		const response = await fetch('https://discord.com/api/oauth2/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				client_id: clientId,
				client_secret: clientSecret,
				grant_type: 'authorization_code',
				code,
				redirect_uri: redirectUri,
			}),
		});

		if (!response.ok) {
			throw new UnauthorizedException(
				'Failed to exchange Discord authorization code',
			);
		}

		return (await response.json()) as DiscordTokenResponse;
	}

	async loginWithDiscord(code: string): Promise<AuthUser> {
		const tokenData = await this.exchangeDiscordCode(code);

		const discordUser = await this.getDiscordUser(tokenData.access_token);

		const user = await this.usersService.findOrCreateByOAuth({
			provider: OAuthProvider.discord,
			oauthId: discordUser.id,
			email: discordUser.email,
			name: discordUser.global_name ?? discordUser.username,
		});

		return {
			id: user.id,
			username: user.username,
		};
	}
}
