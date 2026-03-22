import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type {
	DefaultEventsMap,
	Server,
	ServerOptions,
	Socket,
} from 'socket.io';
import { AuthService } from 'src/modules/auth/auth.service';
import { JwtPayload } from 'src/modules/auth/types/jwt-payload.type';

const SOCKET_IO_PATH = '/api/socket.io';

export type SocketWithAuth = Socket<
	DefaultEventsMap,
	DefaultEventsMap,
	DefaultEventsMap,
	Partial<{ user: JwtPayload }>
>;

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

			const socketWithAuth = socket as SocketWithAuth;
			socketWithAuth.data.user = payload;

			next();
		};

		server.on('new_namespace', (namespace) => {
			namespace.use(authMiddleware);
		});

		return server;
	}
}
