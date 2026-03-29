import { RoomsService } from './../../rooms/rooms.service';
import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	WebSocketServer,
	ConnectedSocket,
} from '@nestjs/websockets';
import { SnakeService } from './snake.service';
import type {
	SnakeDirection,
	SnakeGameState as CoreSnakeGameState,
} from './core';
import { ApiWsHandler } from '../../../realtime/ws/api-ws-handler.decorator';
import type { Server } from 'socket.io';
import {
	SNAKE_GAME_SOCKET_EVENTS,
	type SnakeChangeDirectionPayload,
	SnakeChangeDirectionPayloadSchema,
	type SnakeRoomPayload,
	SnakeRoomPayloadSchema,
} from '@rooms/contracts/snake-game';
import { type SocketWithAuth } from '../../../realtime/ws/api-socket-io.adapter';
import { requireWsUser } from 'src/realtime/ws/require-ws-user';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';

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
		@MessageBody(new ZodValidationPipe(SnakeRoomPayloadSchema))
		payload: SnakeRoomPayload,
	) {
		const userId = requireWsUser(client).sub;
		console.log('🚀 ~ SnakeGateway ~ connectToChat ~ userId:', userId);
		await this.roomsService.findByIdForUserOrThrow(payload.roomId, userId);

		await client.join(payload.roomId);
		console.log(
			'🚀 ~ SnakeGateway ~ connectToChat ~ roomId:',
			payload.roomId,
		);
		return { ok: true };
	}

	@SubscribeMessage(SNAKE_GAME_SOCKET_EVENTS.DISCONNECT)
	async disconnect(
		@ConnectedSocket() client: SocketWithAuth,
		@MessageBody(new ZodValidationPipe(SnakeRoomPayloadSchema))
		payload: SnakeRoomPayload,
	) {
		await client.leave(payload.roomId);
		return { ok: true };
	}

	@SubscribeMessage(SNAKE_GAME_SOCKET_EVENTS.START_GAME)
	startGame(
		@ConnectedSocket() client: SocketWithAuth,
		@MessageBody(new ZodValidationPipe(SnakeRoomPayloadSchema))
		payload: SnakeRoomPayload,
	) {
		const game = this.snakeService.startGame(payload.roomId);

		const onTick = (state: CoreSnakeGameState) => {
			this.server
				.to(payload.roomId)
				.emit(SNAKE_GAME_SOCKET_EVENTS.SNAKE_MOVED, state);
		};
		const onGameOver = (state: CoreSnakeGameState) => {
			this.server
				.to(payload.roomId)
				.emit(SNAKE_GAME_SOCKET_EVENTS.GAME_OVER, state);
		};

		game.on('tick', onTick);
		game.on('gameOver', onGameOver);

		return { ok: true, message: 'Game started!' };
	}

	@SubscribeMessage(SNAKE_GAME_SOCKET_EVENTS.CHANGE_DIRECTION)
	changeDirection(
		@ConnectedSocket() client: SocketWithAuth,
		@MessageBody(new ZodValidationPipe(SnakeChangeDirectionPayloadSchema))
		payload: SnakeChangeDirectionPayload,
	) {
		const direction: SnakeDirection = payload.direction;
		console.log(
			'🚀 ~ SnakeGateway ~ changeDirection ~ direction:',
			payload.direction,
		);
		this.snakeService.changeDirection(payload.roomId, direction);
		return { ok: true, message: 'Direction changed!' };
	}
}
