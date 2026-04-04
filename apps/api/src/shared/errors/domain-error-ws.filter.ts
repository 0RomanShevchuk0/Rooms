import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
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
	catch(exception: unknown, host: ArgumentsHost) {
		if (host.getType() !== 'ws') {
			throw exception;
		}

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

		const client = host.switchToWs().getClient<Socket>();
		client.emit('exception', payload);
	}
}
