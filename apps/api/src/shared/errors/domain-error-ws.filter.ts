import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import type { Socket } from 'socket.io';
import { DomainError } from './domain.error';
import { mapDomainErrorToWsResponse } from './ws-error.mapper';

@Catch(DomainError)
export class DomainErrorWsFilter implements ExceptionFilter {
	catch(exception: DomainError, host: ArgumentsHost) {
		if (host.getType() !== 'ws') {
			throw exception;
		}

		const payload = mapDomainErrorToWsResponse(exception);
		const ack: unknown = host.getArgByIndex(2);
		if (typeof ack === 'function') {
			(ack as (value: unknown) => void)(payload);
			return;
		}

		const client = host.switchToWs().getClient<Socket>();
		client.emit('exception', payload);
	}
}
