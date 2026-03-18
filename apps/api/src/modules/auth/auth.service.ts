import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { PasswordsService } from './passwords.service';
import { AuthUser } from './types/auth-user.type';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly passwordsService: PasswordsService,
		private readonly configService: ConfigService,
		private jwtService: JwtService,
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

	async register(authDto: AuthDto) {
		const existingUser = await this.usersService.findByUsername(
			authDto.username,
		);

		if (existingUser) {
			throw new ConflictException('Username already exists');
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
		if (!user) {
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
}
