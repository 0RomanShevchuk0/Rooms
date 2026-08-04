import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { OAuthProvider } from 'generated/prisma/enums';
import { OAUTH_ERROR_CODES } from '@rooms/contracts/auth';
import { OAuthStateService } from '../oauth-state.service';
import {
	OAuthCallbackError,
	assertNoProviderError,
} from '../oauth-callback.error';

@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
	constructor(private readonly oauthState: OAuthStateService) {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const httpContext = context.switchToHttp();
		const request = httpContext.getRequest<Request>();
		const response = httpContext.getResponse<Response>();

		assertNoProviderError(request.query);
		this.oauthState.verify(
			request,
			response,
			OAuthProvider.google,
			request.query.state,
		);

		return (await super.canActivate(context)) as boolean;
	}

	handleRequest<TUser>(err: unknown, user: TUser): TUser {
		if (err || !user) {
			throw new OAuthCallbackError(
				OAUTH_ERROR_CODES.failed,
				err instanceof Error ? err.message : 'Google authentication failed',
			);
		}

		return user;
	}
}
