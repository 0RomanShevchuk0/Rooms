import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { OAuthProvider } from 'generated/prisma/enums';
import { OAuthStateService } from '../oauth-state.service';

/**
 * Starts the Google flow. `passport-oauth2` forwards a string `state` option
 * as-is, so the value is verified by {@link GoogleCallbackGuard} instead of a
 * passport session store.
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
	constructor(private readonly oauthState: OAuthStateService) {
		super();
	}

	getAuthenticateOptions(context: ExecutionContext) {
		const response = context.switchToHttp().getResponse<Response>();

		return { state: this.oauthState.issue(response, OAuthProvider.google) };
	}
}
