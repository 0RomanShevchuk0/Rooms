import { DOMAIN_ERROR_CODES, isDomainError } from './domain.error';
import {
	DomainWsValidationIssueSchema,
	type DomainWsErrorResponse,
} from '@rooms/contracts/ws';

type DomainWsValidationIssues = NonNullable<DomainWsErrorResponse['issues']>;

function getValidationIssues(error: { metadata?: Record<string, unknown> }) {
	const parsed = DomainWsValidationIssueSchema.array().safeParse(
		error.metadata?.issues,
	);
	if (!parsed.success) {
		return undefined;
	}

	return parsed.data as DomainWsValidationIssues;
}

export function mapDomainErrorToWsResponse(
	error: unknown,
): DomainWsErrorResponse {
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
			return {
				error: 'Bad request',
				code: error.code,
				issues: getValidationIssues(error),
			};
		default:
			return { error: 'Internal error', code: 'INTERNAL_ERROR' };
	}
}
