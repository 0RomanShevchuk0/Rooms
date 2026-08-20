import type { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { OAUTH_ERROR_CODES } from '@rooms/contracts/auth';
import { OAuthProvider } from 'generated/prisma/enums';
import { OAuthStateService } from './oauth-state.service';

interface SetCookie {
	name: string;
	value: string;
	options: CookieOptions;
}

function createService(nodeEnv = 'development') {
	const configService = {
		get: () => nodeEnv,
	} as unknown as ConfigService;

	return new OAuthStateService(configService);
}

function createResponse() {
	const cookies: SetCookie[] = [];
	const cleared: SetCookie[] = [];

	const res = {
		cookie: (name: string, value: string, options: CookieOptions) => {
			cookies.push({ name, value, options });
		},
		clearCookie: (name: string, options: CookieOptions) => {
			cleared.push({ name, value: '', options });
		},
	} as unknown as Response;

	return { res, cookies, cleared };
}

function createRequest(cookies: Record<string, unknown>) {
	return { cookies } as unknown as Request;
}

describe('OAuthStateService', () => {
	describe('issue', () => {
		it('stores the state in a cookie scoped to the auth routes', () => {
			const service = createService();
			const { res, cookies } = createResponse();

			const state = service.issue(res, OAuthProvider.google);

			expect(cookies).toHaveLength(1);
			expect(cookies[0].name).toBe('google_oauth_state');
			expect(cookies[0].value).toBe(state);
			expect(cookies[0].options).toMatchObject({
				httpOnly: true,
				sameSite: 'lax',
				path: '/api/auth',
			});
		});

		it('expires the cookie so a stale attempt cannot be resumed', () => {
			const { res, cookies } = createResponse();

			createService().issue(res, OAuthProvider.google);

			expect(cookies[0].options.maxAge).toBe(10 * 60 * 1000);
		});

		it('issues an unpredictable value', () => {
			const service = createService();
			const { res } = createResponse();

			const first = service.issue(res, OAuthProvider.google);
			const second = service.issue(res, OAuthProvider.google);

			expect(first).toHaveLength(64);
			expect(first).not.toBe(second);
		});

		it('keeps providers on separate cookies so parallel flows do not clash', () => {
			const service = createService();
			const { res, cookies } = createResponse();

			service.issue(res, OAuthProvider.google);
			service.issue(res, OAuthProvider.discord);

			expect(cookies.map((cookie) => cookie.name)).toEqual([
				'google_oauth_state',
				'discord_oauth_state',
			]);
		});

		it('only marks the cookie secure in production', () => {
			const { res: devRes, cookies: devCookies } = createResponse();
			createService('development').issue(devRes, OAuthProvider.google);
			expect(devCookies[0].options.secure).toBe(false);

			const { res: prodRes, cookies: prodCookies } = createResponse();
			createService('production').issue(prodRes, OAuthProvider.google);
			expect(prodCookies[0].options.secure).toBe(true);
		});
	});

	describe('verify', () => {
		const invalidState = expect.objectContaining({
			code: OAUTH_ERROR_CODES.invalidState,
		}) as Error;

		it('accepts the state it issued', () => {
			const service = createService();
			const { res } = createResponse();
			const state = service.issue(res, OAuthProvider.google);
			const req = createRequest({ google_oauth_state: state });

			expect(() =>
				service.verify(req, res, OAuthProvider.google, state),
			).not.toThrow();
		});

		it('rejects a state that does not match the cookie', () => {
			const service = createService();
			const { res } = createResponse();
			const req = createRequest({ google_oauth_state: 'a'.repeat(64) });

			expect(() =>
				service.verify(req, res, OAuthProvider.google, 'b'.repeat(64)),
			).toThrow(invalidState);
		});

		it('rejects a callback with no cookie at all', () => {
			const service = createService();
			const { res } = createResponse();

			expect(() =>
				service.verify(createRequest({}), res, OAuthProvider.google, 'abc'),
			).toThrow(invalidState);
		});

		it('rejects a missing state parameter', () => {
			const service = createService();
			const { res } = createResponse();
			const req = createRequest({ google_oauth_state: 'abc' });

			expect(() =>
				service.verify(req, res, OAuthProvider.google, undefined),
			).toThrow(invalidState);
		});

		it("rejects another provider's state", () => {
			const service = createService();
			const { res } = createResponse();
			const state = service.issue(res, OAuthProvider.discord);
			const req = createRequest({ discord_oauth_state: state });

			expect(() =>
				service.verify(req, res, OAuthProvider.google, state),
			).toThrow(invalidState);
		});

		it('clears the cookie even when verification fails, so it cannot be reused', () => {
			const service = createService();
			const { res, cleared } = createResponse();

			expect(() =>
				service.verify(createRequest({}), res, OAuthProvider.google, 'x'),
			).toThrow();

			expect(cleared[0].name).toBe('google_oauth_state');
			expect(cleared[0].options.path).toBe('/api/auth');
		});
	});
});
