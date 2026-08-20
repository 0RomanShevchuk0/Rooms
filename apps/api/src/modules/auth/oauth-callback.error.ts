import { OAUTH_ERROR_CODES, type OAuthErrorCode } from '@rooms/contracts/auth';

export class OAuthCallbackError extends Error {
	constructor(
		public readonly code: OAuthErrorCode,
		message: string,
	) {
		super(message);
		this.name = 'OAuthCallbackError';
	}
}

export function isOAuthCallbackError(
	error: unknown,
): error is OAuthCallbackError {
	return error instanceof OAuthCallbackError;
}

/**
 * Providers report a refused or failed consent screen as `?error=...` on the
 * callback instead of returning a code.
 */
export function assertNoProviderError(query: Record<string, unknown>) {
	const error = query.error;
	if (typeof error !== 'string') {
		return;
	}

	if (error === 'access_denied') {
		throw new OAuthCallbackError(
			OAUTH_ERROR_CODES.cancelled,
			'User denied the OAuth consent',
		);
	}

	throw new OAuthCallbackError(
		OAUTH_ERROR_CODES.failed,
		`OAuth provider returned an error: ${error}`,
	);
}
