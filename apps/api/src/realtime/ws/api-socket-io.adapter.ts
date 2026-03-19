import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { Server, ServerOptions, Socket } from 'socket.io';
import { AuthService } from 'src/modules/auth/auth.service';

const SOCKET_IO_PATH = '/api/socket.io';

export class ApiSocketIoAdapter extends IoAdapter {
	private authService: AuthService;

	constructor(app: INestApplicationContext) {
		super(app);
		this.authService = app.get(AuthService);
	}

	createIOServer(
		port: number,
		options?: ServerOptions,
	): ReturnType<IoAdapter['createIOServer']> {
		const server = super.createIOServer(port, {
			...(options ?? {}),
			path: SOCKET_IO_PATH,
			addTrailingSlash: false,
		}) as Server;

		const authMiddleware = (socket: Socket, next: (err?: Error) => void) => {
			const token = socket.handshake.auth?.token as string;
			const payload = this.authService.verifyAccessToken(token);

			if (!payload?.sub) {
				return next(new Error('Unauthorized'));
			}

			next();
		};

		server.on('new_namespace', (namespace) => {
			namespace.use(authMiddleware);
		});

		return server;
	}
}
