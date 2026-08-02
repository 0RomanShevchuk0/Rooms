import {
	Controller,
	Post,
	Body,
	UseGuards,
	Res,
	Req,
	Get,
	Query,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthUser } from './types/auth-user.type';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import {
	AuthCredentialsSchema,
	type AuthCredentials,
	type AuthLogoutResponse,
	type AuthRefreshTokensResponse,
	type AuthTokenResponse,
} from '@rooms/contracts/auth';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService,
	) {}

	private setAuthCookies(
		res: Response,
		tokens: { access_token: string; refresh_token: string },
	) {
		const isProd = this.configService.get('NODE_ENV') === 'production';

		res.cookie('refresh_token', tokens.refresh_token, {
			httpOnly: true,
			secure: isProd,
			sameSite: 'lax',
			path: '/api/auth/refresh-tokens',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
		});
	}

	@UseGuards(LocalAuthGuard)
	@Post('login')
	async login(
		@CurrentUser() user: AuthUser,
		@Body(new ZodValidationPipe(AuthCredentialsSchema))
		authDto: AuthCredentials,
		@Res({ passthrough: true }) res: Response,
	): Promise<AuthTokenResponse> {
		void authDto;
		const tokens = await this.authService.login(user);
		this.setAuthCookies(res, tokens);
		return { access_token: tokens.access_token };
	}

	@Post('register')
	async register(
		@Body(new ZodValidationPipe(AuthCredentialsSchema))
		authDto: AuthCredentials,
		@Res({ passthrough: true }) res: Response,
	): Promise<AuthTokenResponse> {
		const tokens = await this.authService.register(authDto);
		this.setAuthCookies(res, tokens);
		return { access_token: tokens.access_token };
	}

	@Post('logout')
	logout(@Res({ passthrough: true }) res: Response): AuthLogoutResponse {
		const isProd = this.configService.get('NODE_ENV') === 'production';

		res.clearCookie('refresh_token', {
			httpOnly: true,
			secure: isProd,
			sameSite: 'lax',
			path: '/api/auth/refresh-tokens',
		});

		return { message: 'Logged out successfully' };
	}

	@Post('refresh-tokens')
	async refreshTokens(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<AuthRefreshTokensResponse> {
		const refreshToken = req.cookies.refresh_token as string | undefined;

		if (!refreshToken) {
			return { error: 'Missing refresh token' };
		}

		const tokens = await this.authService.refreshTokens(refreshToken);
		if (!tokens) {
			return { error: 'Invalid refresh token' };
		}

		this.setAuthCookies(res, tokens);
		return { access_token: tokens.access_token };
	}

	// OAuth routes
	@Get('google')
	@UseGuards(GoogleAuthGuard)
	googleOauth() {}

	@Get('google-redirect')
	@UseGuards(GoogleAuthGuard)
	async googleOauthCallback(
		@CurrentUser() user: AuthUser,
		@Res({ passthrough: true }) res: Response,
	) {
		const tokens = await this.authService.login(user);
		this.setAuthCookies(res, tokens);

		const clientUrl = this.configService.getOrThrow<string>('CLIENT_URL');
		res.redirect(clientUrl);
	}

	@Get('discord')
	discordOauth(@Res({ passthrough: true }) res: Response) {
		const { url, state } = this.authService.getDiscordAuthorizationUrl();

		res.cookie('discord_oauth_state', state, {
			httpOnly: true,
			secure: this.configService.getOrThrow('NODE_ENV') === 'production',
			sameSite: 'lax',
			maxAge: 10 * 60 * 1000, // 10 minutes
		});

		return res.redirect(url);
	}

	@Get('discord-redirect')
	async discordOauthCallback(
		@Query('code') code: string,
		@Query('state') state: string,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const savedState = req.cookies.discord_oauth_state as string | undefined;

		if (!state || !savedState || state !== savedState) {
			throw new UnauthorizedException('Invalid OAuth state');
		}

		res.clearCookie('discord_oauth_state');

		const user = await this.authService.loginWithDiscord(code);

		const tokens = await this.authService.login(user);

		this.setAuthCookies(res, tokens);

		const clientUrl = this.configService.getOrThrow<string>('CLIENT_URL');

		return res.redirect(clientUrl);
	}
}
