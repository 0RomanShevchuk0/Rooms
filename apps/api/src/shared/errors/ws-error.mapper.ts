import { WsException } from '@nestjs/websockets';
import { DOMAIN_ERROR_CODES, type DomainError } from './domain.error';
import {
	DomainWsErrorResponseSchema,
	DomainWsValidationIssueSchema,
	NestWsErrorResponseSchema,
	type WsErrorResponse,
	type DomainWsErrorResponse,
} from '@rooms/contracts/ws';

type DomainWsValidationIssues = NonNullable<DomainWsErrorResponse['issues']>;

function getValidationIssues(error: DomainError) {
	const parsed = DomainWsValidationIssueSchema.array().safeParse(
		error.metadata?.issues,
	);
	if (!parsed.success) {
		return undefined;
	}

	return parsed.data as DomainWsValidationIssues;
}

export function mapDomainErrorToWsResponse(
	error: DomainError,
): DomainWsErrorResponse {
	switch (error.code) {
		case DOMAIN_ERROR_CODES.ACCESS_DENIED:
			return { error: 'Forbidden', code: error.code };
		case DOMAIN_ERROR_CODES.NOT_FOUND:
			return { error: 'Not found', code: error.code };
		case DOMAIN_ERROR_CODES.CONFLICT:
			return { error: 'Conflict', code: error.code };
		case DOMAIN_ERROR_CODES.VALIDATION:
			return {
				error: 'Bad request',
				code: error.code,
				issues: getValidationIssues(error),
			};
		default:
			return { error: 'Internal error', code: 'INTERNAL_ERROR' };
	}
}

export function mapWsExceptionToWsResponse(
	error: WsException,
): WsErrorResponse {
	const wsError = error.getError();
	if (typeof wsError === 'string') {
		return { status: 'error', message: wsError };
	}

	const parsedDomain = DomainWsErrorResponseSchema.safeParse(wsError);
	if (parsedDomain.success) {
		return parsedDomain.data;
	}

	const parsedNest = NestWsErrorResponseSchema.safeParse(wsError);
	if (parsedNest.success) {
		return parsedNest.data;
	}

	if (
		wsError &&
		typeof wsError === 'object' &&
		'message' in wsError &&
		typeof wsError.message === 'string'
	) {
		return { status: 'error', message: wsError.message };
	}

	if (
		wsError &&
		typeof wsError === 'object' &&
		'error' in wsError &&
		typeof wsError.error === 'string'
	) {
		return { error: wsError.error, code: 'INTERNAL_ERROR' };
	}

	return { error: 'Internal error', code: 'INTERNAL_ERROR' };
}

export function mapUnknownErrorToWsResponse(): DomainWsErrorResponse {
	return { error: 'Internal error', code: 'INTERNAL_ERROR' };
}
