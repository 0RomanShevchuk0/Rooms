import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import type { ServerOptions } from 'socket.io';

const SOCKET_IO_PATH = '/api/socket.io';

export class ApiSocketIoAdapter extends IoAdapter {
	constructor(app: INestApplicationContext) {
		super(app);
	}

	createIOServer(
		port: number,
		options?: ServerOptions,
	): ReturnType<IoAdapter['createIOServer']> {
		return super.createIOServer(port, {
			...(options ?? {}),
			path: SOCKET_IO_PATH,
			addTrailingSlash: false,
		});
	}
}
