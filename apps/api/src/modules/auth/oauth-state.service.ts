import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { CookieOptions, Request, Response } from 'express';
import { OAuthProvider } from 'generated/prisma/enums';
import { OAUTH_ERROR_CODES } from '@rooms/contracts/auth';
import { OAuthCallbackError } from './oauth-callback.error';

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const STATE_BYTES = 32;
const STATE_COOKIE_PATH = '/api/auth';

/**
 * CSRF protection for the OAuth authorization code flow: a random value is
 * stored in an httpOnly cookie before the redirect to the provider and has to
 * come back unchanged on the callback.
 */
@Injectable()
export class OAuthStateService {
	constructor(private readonly configService: ConfigService) {}

	private cookieName(provider: OAuthProvider): string {
		return `${provider}_oauth_state`;
	}

	private cookieOptions(): CookieOptions {
		return {
			httpOnly: true,
			secure: this.configService.get('NODE_ENV') === 'production',
			sameSite: 'lax',
			path: STATE_COOKIE_PATH,
		};
	}

	issue(res: Response, provider: OAuthProvider): string {
		const state = randomBytes(STATE_BYTES).toString('hex');

		res.cookie(this.cookieName(provider), state, {
			...this.cookieOptions(),
			maxAge: STATE_TTL_MS,
		});

		return state;
	}

	verify(
		req: Request,
		res: Response,
		provider: OAuthProvider,
		state: unknown,
	): void {
		const cookieName = this.cookieName(provider);
		const savedState = (req.cookies as Record<string, unknown> | undefined)?.[
			cookieName
		];

		res.clearCookie(cookieName, this.cookieOptions());

		if (
			typeof state !== 'string' ||
			typeof savedState !== 'string' ||
			!safeCompare(state, savedState)
		) {
			throw new OAuthCallbackError(
				OAUTH_ERROR_CODES.invalidState,
				`Invalid OAuth state for provider "${provider}"`,
			);
		}
	}
}

function safeCompare(a: string, b: string): boolean {
	const left = Buffer.from(a);
	const right = Buffer.from(b);

	if (left.length !== right.length) {
		return false;
	}

	return timingSafeEqual(left, right);
}
