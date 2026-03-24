import { DOMAIN_ERROR_CODES, isDomainError } from './domain.error';

type WsErrorResponse = {
	error: string;
	code: string;
};

export function mapDomainErrorToWsResponse(error: unknown): WsErrorResponse {
	if (!isDomainError(error)) {
		return { error: 'Internal error', code: 'INTERNAL_ERROR' };
	}

	switch (error.code) {
		case DOMAIN_ERROR_CODES.ACCESS_DENIED:
			return { error: 'Forbidden', code: error.code };
		case DOMAIN_ERROR_CODES.NOT_FOUND:
			return { error: 'Not found', code: error.code };
		case DOMAIN_ERROR_CODES.CONFLICT:
			return { error: 'Conflict', code: error.code };
		case DOMAIN_ERROR_CODES.VALIDATION:
			return { error: 'Bad request', code: error.code };
		default:
			return { error: 'Internal error', code: 'INTERNAL_ERROR' };
	}
}
