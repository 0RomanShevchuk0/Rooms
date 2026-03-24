import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
} from '@nestjs/common';
import type { Response } from 'express';
import type { Socket } from 'socket.io';
import { DomainError } from './domain.error';
import { mapDomainErrorToHttpException } from './http-error.mapper';
import { mapDomainErrorToWsResponse } from './ws-error.mapper';

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
	catch(exception: DomainError, host: ArgumentsHost) {
		const contextType = host.getType<'http' | 'ws' | 'rpc'>();

		if (contextType === 'http') {
			const httpException = mapDomainErrorToHttpException(
				exception,
			) as HttpException;

			const ctx = host.switchToHttp();
			const response = ctx.getResponse<Response>();
			const status = httpException.getStatus();
			const body = httpException.getResponse();

			response.status(status).json(body);
			return;
		}

		if (contextType === 'ws') {
			const payload = mapDomainErrorToWsResponse(exception);
			const ack: unknown = host.getArgByIndex(2);
			if (typeof ack === 'function') {
				(ack as (value: unknown) => void)(payload);
				return;
			}

			const client = host.switchToWs().getClient<Socket>();
			client.emit('exception', payload);
			return;
		}

		throw exception;
	}
}
