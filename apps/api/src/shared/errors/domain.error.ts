export const DOMAIN_ERROR_CODES = {
	NOT_FOUND: 'NOT_FOUND',
	ACCESS_DENIED: 'ACCESS_DENIED',
	CONFLICT: 'CONFLICT',
	VALIDATION: 'VALIDATION',
} as const;

export type DomainErrorCode =
	(typeof DOMAIN_ERROR_CODES)[keyof typeof DOMAIN_ERROR_CODES];

export class DomainError extends Error {
	constructor(
		public readonly code: DomainErrorCode,
		message: string,
		public readonly metadata?: Record<string, unknown>,
	) {
		super(message);
		this.name = 'DomainError';
	}

	static notFound(message: string, metadata?: Record<string, unknown>) {
		return new DomainError(DOMAIN_ERROR_CODES.NOT_FOUND, message, metadata);
	}

	static accessDenied(message: string, metadata?: Record<string, unknown>) {
		return new DomainError(
			DOMAIN_ERROR_CODES.ACCESS_DENIED,
			message,
			metadata,
		);
	}

	static conflict(message: string, metadata?: Record<string, unknown>) {
		return new DomainError(DOMAIN_ERROR_CODES.CONFLICT, message, metadata);
	}

	static validation(message: string, metadata?: Record<string, unknown>) {
		return new DomainError(DOMAIN_ERROR_CODES.VALIDATION, message, metadata);
	}
}

export function isDomainError(error: unknown): error is DomainError {
	return error instanceof DomainError;
}
