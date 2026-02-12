import { Controller, Post, Body, UseGuards, Res, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthUser } from './types/auth-user.type';
import { LocalAuthGuard } from './guards/local-auth.guard';

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
		@Body() authDto: AuthDto,
		@Res({ passthrough: true }) res: Response,
	) {
		void authDto;
		const tokens = await this.authService.login(user);
		this.setAuthCookies(res, tokens);
		return { access_token: tokens.access_token };
	}

	@Post('register')
	async register(
		@Body() authDto: AuthDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const tokens = await this.authService.register(authDto);
		this.setAuthCookies(res, tokens);
		return { access_token: tokens.access_token };
	}

	@Post('logout')
	logout(@Res({ passthrough: true }) res: Response) {
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
	) {
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
}
