import { RoomsService } from './../../rooms/rooms.service';
import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	WebSocketServer,
	ConnectedSocket,
} from '@nestjs/websockets';
import { SnakeService } from './snake.service';
import { DirectionEnum, SnakeGameState } from './core';
import { ApiWsHandler } from '../../../realtime/ws/api-ws-handler.decorator';
import type { Server } from 'socket.io';
import { SNAKE_GAME_SOCKET_EVENTS } from './snake-ws.constants';
import { type SocketWithAuth } from '../../../realtime/ws/api-socket-io.adapter';
import { requireWsUser } from 'src/realtime/ws/require-ws-user';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];

@ApiWsHandler()
@WebSocketGateway({
	namespace: '/snake-game',
	cors: {
		origin: allowedOrigins,
		credentials: true,
	},
})
export class SnakeGateway {
	@WebSocketServer()
	server!: Server;

	constructor(
		private readonly snakeService: SnakeService,
		private readonly roomsService: RoomsService,
	) {}

	@SubscribeMessage(SNAKE_GAME_SOCKET_EVENTS.CONNECT)
	async connectToChat(
		@ConnectedSocket() client: SocketWithAuth,
		@MessageBody() body: { roomId: string },
	) {
		const userId = requireWsUser(client).sub;
		console.log('🚀 ~ SnakeGateway ~ connectToChat ~ userId:', userId);
		await this.roomsService.findByIdForUserOrThrow(body.roomId, userId);

		await client.join(body.roomId);
		console.log('🚀 ~ SnakeGateway ~ connectToChat ~ roomId:', body.roomId);
		return { ok: true };
	}

	@SubscribeMessage(SNAKE_GAME_SOCKET_EVENTS.DISCONNECT)
	async disconnect(
		@ConnectedSocket() client: SocketWithAuth,
		@MessageBody() body: { roomId: string },
	) {
		await client.leave(body.roomId);
		return { ok: true };
	}

	@SubscribeMessage(SNAKE_GAME_SOCKET_EVENTS.START_GAME)
	startGame(
		@ConnectedSocket() client: SocketWithAuth,
		@MessageBody() body: { roomId: string },
	) {
		const game = this.snakeService.startGame(body.roomId);

		const onTick = (state: SnakeGameState) => {
			this.server
				.to(body.roomId)
				.emit(SNAKE_GAME_SOCKET_EVENTS.SNAKE_MOVED, state);
		};
		const onGameOver = (state: SnakeGameState) => {
			this.server
				.to(body.roomId)
				.emit(SNAKE_GAME_SOCKET_EVENTS.GAME_OVER, state);
		};

		game.on('tick', onTick);
		game.on('gameOver', onGameOver);

		return { ok: true, message: 'Game started!' };
	}

	@SubscribeMessage(SNAKE_GAME_SOCKET_EVENTS.CHANGE_DIRECTION)
	changeDirection(
		@ConnectedSocket() client: SocketWithAuth,
		@MessageBody() body: { roomId: string; direction: DirectionEnum },
	) {
		console.log(
			'🚀 ~ SnakeGateway ~ changeDirection ~ direction:',
			body.direction,
		);
		this.snakeService.changeDirection(body.roomId, body.direction);
		return { ok: true, message: 'Direction changed!' };
	}
}
