import { OAUTH_ERROR_CODES } from '@rooms/contracts/auth';
import { DomainError } from 'src/shared/errors/domain.error';
import type { OAuthStateService } from '../oauth-state.service';
import { OAuthCallbackError } from '../oauth-callback.error';
import { GoogleCallbackGuard } from './google-callback.guard';

function createGuard() {
	const oauthState = {
		issue: jest.fn(),
		verify: jest.fn(),
	} as unknown as OAuthStateService;

	return new GoogleCallbackGuard(oauthState);
}

describe('GoogleCallbackGuard.handleRequest', () => {
	it('passes the authenticated user through', () => {
		const user = { id: 'u1', username: 'roman' };

		expect(createGuard().handleRequest(null, user)).toBe(user);
	});

	// Regression: flattening every strategy error into a generic failure hid the
	// reason a sign-in was refused, so the login page showed "try again" for a
	// conflict the user could do nothing about.
	it('preserves an error raised by the strategy', () => {
		const conflict = DomainError.conflict('Email is already linked');

		expect(() => createGuard().handleRequest(conflict, null)).toThrow(
			conflict,
		);
	});

	it('reports a generic failure when passport returns no user', () => {
		expect(() => createGuard().handleRequest(null, null)).toThrow(
			expect.objectContaining({ code: OAUTH_ERROR_CODES.failed }) as Error,
		);
	});

	it('wraps a non-error rejection so it can still be classified', () => {
		let thrown: unknown;
		try {
			createGuard().handleRequest('something odd', null);
		} catch (error) {
			thrown = error;
		}

		expect(thrown).toBeInstanceOf(OAuthCallbackError);
	});
});
