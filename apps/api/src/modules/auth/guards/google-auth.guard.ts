import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { OAuthProvider } from 'generated/prisma/enums';
import { OAuthStateService } from '../oauth-state.service';
import { OAuthReturnToService } from '../oauth-return-to.service';

/**
 * Starts the Google flow. `passport-oauth2` forwards a string `state` option
 * as-is, so the value is verified by {@link GoogleCallbackGuard} instead of a
 * passport session store.
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
	constructor(
		private readonly oauthState: OAuthStateService,
		private readonly oauthReturnTo: OAuthReturnToService,
	) {
		super();
	}

	// Passport redirects to Google from inside the guard, before any handler
	// runs, so this is the last place to look at the incoming request.
	getAuthenticateOptions(context: ExecutionContext) {
		const http = context.switchToHttp();
		const request = http.getRequest<Request>();
		const response = http.getResponse<Response>();

		this.oauthReturnTo.remember(request, response);

		return { state: this.oauthState.issue(response, OAuthProvider.google) };
	}
}
