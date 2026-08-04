import { Logger, type ArgumentsHost } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { OAUTH_ERROR_CODES } from '@rooms/contracts/auth';
import { DomainError } from 'src/shared/errors/domain.error';
import { OAuthCallbackErrorFilter } from './oauth-callback-error.filter';
import { OAuthCallbackError } from './oauth-callback.error';

const CLIENT_URL = 'http://localhost:3000';

function createFilter(clientUrl = CLIENT_URL) {
	const configService = {
		getOrThrow: () => clientUrl,
	} as unknown as ConfigService;

	return new OAuthCallbackErrorFilter(configService);
}

function captureRedirect(filter: OAuthCallbackErrorFilter, exception: unknown) {
	let redirectedTo: string | undefined;

	const host = {
		switchToHttp: () => ({
			getResponse: () => ({
				redirect: (url: string) => {
					redirectedTo = url;
				},
			}),
		}),
	} as unknown as ArgumentsHost;

	filter.catch(exception, host);

	return new URL(redirectedTo ?? '');
}

describe('OAuthCallbackErrorFilter', () => {
	let filter: OAuthCallbackErrorFilter;

	beforeEach(() => {
		filter = createFilter();
		// Every case here goes down a failure path, which the filter logs.
		jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('always redirects to the login page instead of returning a body', () => {
		const url = captureRedirect(filter, new Error('boom'));

		expect(url.origin).toBe(CLIENT_URL);
		expect(url.pathname).toBe('/auth/login');
	});

	it('keeps the code carried by an OAuth callback error', () => {
		const url = captureRedirect(
			filter,
			new OAuthCallbackError(OAUTH_ERROR_CODES.cancelled, 'denied'),
		);

		expect(url.searchParams.get('error')).toBe(OAUTH_ERROR_CODES.cancelled);
	});

	it('maps a conflict to an already-used account', () => {
		const url = captureRedirect(
			filter,
			DomainError.conflict('Account already exists'),
		);

		expect(url.searchParams.get('error')).toBe(
			OAUTH_ERROR_CODES.accountExists,
		);
	});

	it('separates a deleted account from an account that is merely taken', () => {
		const url = captureRedirect(
			filter,
			DomainError.conflict('Account was deleted', { deleted: true }),
		);

		expect(url.searchParams.get('error')).toBe(
			OAUTH_ERROR_CODES.accountDeleted,
		);
	});

	it('falls back to a generic failure for anything unrecognised', () => {
		const url = captureRedirect(filter, DomainError.notFound('nope'));

		expect(url.searchParams.get('error')).toBe(OAUTH_ERROR_CODES.failed);
	});

	it('names the sign-in method that owns the email when it is known', () => {
		const url = captureRedirect(
			filter,
			DomainError.conflict('Already linked', { linkedProvider: 'google' }),
		);

		expect(url.searchParams.get('provider')).toBe('google');
	});

	it('omits the provider when it is unknown', () => {
		const url = captureRedirect(
			filter,
			DomainError.conflict('Already linked', { linkedProvider: null }),
		);

		expect(url.searchParams.has('provider')).toBe(false);
	});

	it('does not double the slash when CLIENT_URL has a trailing one', () => {
		const url = captureRedirect(
			createFilter('http://localhost:3000/'),
			new Error('boom'),
		);

		expect(url.pathname).toBe('/auth/login');
	});
});
