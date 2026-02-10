import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthUser } from './types/auth-user.type';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UseGuards(LocalAuthGuard)
	@Post('login')
	login(@CurrentUser() user: AuthUser, @Body() authDto: AuthDto) {
		void authDto;
		return this.authService.login(user);
	}

	@Post('register')
	register(@Body() authDto: AuthDto) {
		return this.authService.register(authDto);
	}

	@Post('logout')
	logout() {
		return this.authService.logout();
	}
}
