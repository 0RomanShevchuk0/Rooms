import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { WsErrorResponse } from '@rooms/contracts/ws';
import type { Socket } from 'socket.io';
import { isDomainError } from './domain.error';
import {
	mapDomainErrorToWsResponse,
	mapUnknownErrorToWsResponse,
	mapWsExceptionToWsResponse,
} from './ws-error.mapper';

@Catch()
export class DomainErrorWsFilter implements ExceptionFilter {
	private readonly logger = new Logger(DomainErrorWsFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		if (host.getType() !== 'ws') {
			throw exception;
		}

		const client = host.switchToWs().getClient<Socket>();
		const message =
			exception instanceof Error ? exception.message : String(exception);
		this.logger.error(
			`WS exception for socket ${client.id}: ${message}`,
			exception instanceof Error ? exception.stack : undefined,
		);

		let payload: WsErrorResponse = mapUnknownErrorToWsResponse();
		if (isDomainError(exception)) {
			payload = mapDomainErrorToWsResponse(exception);
		} else if (exception instanceof WsException) {
			payload = mapWsExceptionToWsResponse(exception);
		}
		const ack: unknown = host.getArgByIndex(2);
		if (typeof ack === 'function') {
			(ack as (value: unknown) => void)(payload);
			return;
		}

		client.emit('exception', payload);
	}
}
