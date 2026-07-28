import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthUser } from '../types/auth-user.type';
import { Profile, Strategy } from 'passport-google-oauth20';
import { UsersService } from 'src/modules/users/users.service';
import { OAuthProvider } from 'generated/prisma/enums';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(
		private readonly configService: ConfigService,
		private readonly usersService: UsersService,
	) {
		super({
			clientID: configService.getOrThrow('GOOGLE_CLIENT_ID'),
			clientSecret: configService.getOrThrow('GOOGLE_CLIENT_SECRET'),
			callbackURL: configService.getOrThrow('GOOGLE_CALLBACK_URL'),
			scope: ['profile', 'email'],
		});
	}

	async validate(
		_accessToken: string,
		_refreshToken: string,
		profile: Profile,
	): Promise<AuthUser> {
		const { name, emails } = profile;
		const userData = {
			email: emails?.[0]?.value,
			name: `${name?.givenName} ${name?.familyName}`,
		};

		if (!userData.email) {
			throw new UnauthorizedException('Email is required');
		}

		const user = await this.usersService.findOrCreateByOAuth({
			provider: OAuthProvider.google,
			oauthId: profile.id,
			email: userData.email,
			name: userData.name,
		});

		return {
			id: user.id,
			username: user.username,
		};
	}
}
