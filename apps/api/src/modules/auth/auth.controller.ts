import {
	Controller,
	Post,
	Body,
	UseGuards,
	UseFilters,
	Res,
	Req,
	Get,
	Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { OAuthProvider } from 'generated/prisma/enums';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthUser } from './types/auth-user.type';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GoogleCallbackGuard } from './guards/google-callback.guard';
import { OAuthStateService } from './oauth-state.service';
import { OAuthCallbackErrorFilter } from './oauth-callback-error.filter';
import {
	OAuthCallbackError,
	assertNoProviderError,
} from './oauth-callback.error';
import {
	AuthCredentialsSchema,
	OAUTH_ERROR_CODES,
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
		private readonly oauthState: OAuthStateService,
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
	private async completeOAuthLogin(user: AuthUser, res: Response) {
		const tokens = await this.authService.login(user);
		this.setAuthCookies(res, tokens);

		const clientUrl = this.configService.getOrThrow<string>('CLIENT_URL');
		res.redirect(clientUrl);
	}

	@Get('google')
	@UseGuards(GoogleAuthGuard)
	googleOauth() {}

	@Get('google-redirect')
	@UseFilters(OAuthCallbackErrorFilter)
	@UseGuards(GoogleCallbackGuard)
	async googleOauthCallback(
		@CurrentUser() user: AuthUser,
		@Res({ passthrough: true }) res: Response,
	) {
		await this.completeOAuthLogin(user, res);
	}

	@Get('discord')
	discordOauth(@Res({ passthrough: true }) res: Response) {
		const state = this.oauthState.issue(res, OAuthProvider.discord);
		const url = this.authService.getDiscordAuthorizationUrl(state);

		res.redirect(url);
	}

	@Get('discord-redirect')
	@UseFilters(OAuthCallbackErrorFilter)
	async discordOauthCallback(
		@Query() query: Record<string, string | undefined>,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		assertNoProviderError(query);
		this.oauthState.verify(req, res, OAuthProvider.discord, query.state);

		if (!query.code) {
			throw new OAuthCallbackError(
				OAUTH_ERROR_CODES.failed,
				'Missing Discord authorization code',
			);
		}

		const user = await this.authService.loginWithDiscord(query.code);

		await this.completeOAuthLogin(user, res);
	}
}
