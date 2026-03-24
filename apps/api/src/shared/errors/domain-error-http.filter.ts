import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainError } from './domain.error';
import { mapDomainErrorToHttpException } from './http-error.mapper';

@Catch(DomainError)
export class DomainErrorHttpFilter implements ExceptionFilter {
	catch(exception: DomainError, host: ArgumentsHost) {
		if (host.getType() !== 'http') {
			throw exception;
		}

		const httpException = mapDomainErrorToHttpException(
			exception,
		) as HttpException;

		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const status = httpException.getStatus();
		const body = httpException.getResponse();

		response.status(status).json(body);
	}
}
