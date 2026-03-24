import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import {
	type DomainError,
	DOMAIN_ERROR_CODES,
	isDomainError,
} from './domain.error';

function getExceptionPayload(error: DomainError): string | object {
	if (!error.metadata) {
		return error.message;
	}

	return {
		message: error.message,
		...error.metadata,
	};
}

export function mapDomainErrorToHttpException(error: unknown) {
	if (!isDomainError(error)) {
		return new InternalServerErrorException('Internal error');
	}

	const payload = getExceptionPayload(error);

	switch (error.code) {
		case DOMAIN_ERROR_CODES.NOT_FOUND:
			return new NotFoundException(payload);
		case DOMAIN_ERROR_CODES.ACCESS_DENIED:
			return new ForbiddenException(payload);
		case DOMAIN_ERROR_CODES.CONFLICT:
			return new ConflictException(payload);
		case DOMAIN_ERROR_CODES.VALIDATION:
			return new BadRequestException(payload);
		default:
			return new InternalServerErrorException('Internal error');
	}
}
