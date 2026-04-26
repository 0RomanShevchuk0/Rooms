import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainError } from './domain.error';
import { mapDomainErrorToHttpException } from './http-error.mapper';

@Catch(DomainError)
export class DomainErrorHttpFilter implements ExceptionFilter {
	private readonly logger = new Logger(DomainErrorHttpFilter.name);

	catch(exception: DomainError, host: ArgumentsHost) {
		if (host.getType() !== 'http') {
			throw exception;
		}

		const httpException = mapDomainErrorToHttpException(
			exception,
		) as HttpException;

		const ctx = host.switchToHttp();
		const request = ctx.getRequest<{ method: string; url: string }>();
		const response = ctx.getResponse<Response>();
		const status = httpException.getStatus();
		const body = httpException.getResponse();

		this.logger.error(
			`${request.method} ${request.url} -> ${status} ${exception.code}: ${exception.message}`,
			exception.stack,
		);

		response.status(status).json(body);
	}
}
