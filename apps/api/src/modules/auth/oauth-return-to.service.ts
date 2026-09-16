import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';

const COOKIE_NAME = 'oauth_return_to';
const COOKIE_TTL_MS = 10 * 60 * 1000;
const COOKIE_PATH = '/api/auth';

/**
 * Carries the page a guest was heading for across the provider round trip:
 * the browser leaves the app for Google or Discord and comes back on the
 * callback, so the value has to live in a cookie, like the CSRF state does.
 */
@Injectable()
export class OAuthReturnToService {
	constructor(private readonly configService: ConfigService) {}

	private cookieOptions(): CookieOptions {
		return {
			httpOnly: true,
			secure: this.configService.get('NODE_ENV') === 'production',
			sameSite: 'lax',
			path: COOKIE_PATH,
		};
	}

	remember(req: Request, res: Response): void {
		const returnTo = toLocalPath(req.query.next);
		if (!returnTo) return;

		res.cookie(COOKIE_NAME, returnTo, {
			...this.cookieOptions(),
			maxAge: COOKIE_TTL_MS,
		});
	}

	consume(req: Request, res: Response): string | null {
		const saved = (req.cookies as Record<string, unknown> | undefined)?.[
			COOKIE_NAME
		];
		res.clearCookie(COOKIE_NAME, this.cookieOptions());

		return toLocalPath(saved);
	}
}

/** Same-origin paths only, so the callback can never send someone off-site. */
function toLocalPath(value: unknown): string | null {
	if (typeof value !== 'string' || !value.startsWith('/')) return null;
	if (value.startsWith('//') || value.startsWith('/\\')) return null;

	return value;
}
