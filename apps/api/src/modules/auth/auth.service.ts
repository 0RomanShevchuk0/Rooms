import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { PasswordsService } from './passwords.service';
import { UserForAuth } from '../users/types/user-for-auth.type';
import { AuthUser } from './types/auth-user.type';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly passwordsService: PasswordsService,
		private jwtService: JwtService,
	) {}

	async login(user: AuthUser) {
		const payload: JwtPayload = {
			sub: user.id,
			username: user.username,
		};

		return {
			access_token: await this.jwtService.signAsync(payload),
		};
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

		return {
			access_token: await this.jwtService.signAsync(payload),
		};
	}

	logout() {
		return 'This action logs out the user';
	}

	async validateUser(
		username: string,
		password: string,
	): Promise<UserForAuth | null> {
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

		return user;
	}
}
