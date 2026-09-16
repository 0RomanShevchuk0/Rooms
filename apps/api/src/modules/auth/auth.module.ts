import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PasswordsModule } from './passwords.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { OAuthStateService } from './oauth-state.service';
import { OAuthReturnToService } from './oauth-return-to.service';

@Module({
	imports: [
		UsersModule,
		PasswordsModule,
		// Secrets and lifetimes are passed per call in AuthService, since the
		// access and refresh tokens use different ones.
		JwtModule.register({ global: true }),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		OAuthStateService,
		OAuthReturnToService,
		LocalStrategy,
		JwtStrategy,
		GoogleStrategy,
	],
	exports: [AuthService, JwtModule],
})
export class AuthModule {}
