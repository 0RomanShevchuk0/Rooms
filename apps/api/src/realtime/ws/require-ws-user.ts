import { WsException } from '@nestjs/websockets';
import type { JwtPayload } from 'src/modules/auth/types/jwt-payload.type';
import type { SocketWithAuth } from './api-socket-io.adapter';

export function requireWsUser(client: SocketWithAuth): JwtPayload {
	const user = client.data.user;

	if (!user?.sub) {
		throw new WsException({
			error: 'Unauthorized',
			code: 'UNAUTHORIZED',
		});
	}

	return user;
}
