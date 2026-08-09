import { RoomsService } from './../../rooms/rooms.service';
import { Logger, type OnModuleInit } from '@nestjs/common';
import { RoomLobbyService } from '../../rooms/lobby/room-lobby.service';
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
	type SnakeChangeSettingsPayload,
	SnakeChangeSettingsPayloadSchema,
	type SnakeSettingsChangedPayload,
	type SnakeRoomPayload,
	SnakeRoomPayloadSchema,
} from '@rooms/contracts/snake-game';
import { type SocketWithAuth } from '../../../realtime/ws/api-socket-io.adapter';
import { requireWsUser } from 'src/realtime/ws/require-ws-user';
import { DomainError } from 'src/shared/errors/domain.error';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';
import { toSnakeGameStatePayload } from './snake.mapper';
import { RoomSettingsService } from 'src/modules/rooms/room-settings/room-settings.service';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];

@ApiWsHandler()
@WebSocketGateway({
	namespace: '/snake-game',
	cors: {
		origin: allowedOrigins,
		credentials: true,
	},
})
export class SnakeGateway implements OnModuleInit {
	@WebSocketServer()
	server!: Server;

	private readonly logger = new Logger(SnakeGateway.name);

	constructor(
		private readonly snakeService: SnakeService,
		private readonly roomsService: RoomsService,
		private readonly roomSettingsService: RoomSettingsService,
		private readonly lobby: RoomLobbyService,
	) {}

	onModuleInit() {
		this.lobby.on('matchStart', (roomId, playerIds) => {
			void this.runMatch(roomId, playerIds);
		});
	}

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

	private async runMatch(roomId: string, playerIds: string[]) {
		try {
			const game = await this.snakeService.startGame(roomId, playerIds);

			game.on('tick', (state: CoreSnakeGameState) => {
				this.emitGameState(
					roomId,
					SNAKE_GAME_SOCKET_EVENTS.SNAKE_MOVED,
					state,
				);
			});
			game.on('gameOver', (state: CoreSnakeGameState) => {
				this.emitGameState(
					roomId,
					SNAKE_GAME_SOCKET_EVENTS.GAME_OVER,
					state,
				);
				this.lobby.endMatch(roomId);
			});
		} catch (error) {
			// A room stuck in the running phase could never reach the lobby again.
			this.lobby.endMatch(roomId);
			this.logger.error(
				`Failed to start the game for roomId: ${roomId}`,
				error,
			);
		}
	}

	private emitGameState(
		roomId: string,
		event:
			| typeof SNAKE_GAME_SOCKET_EVENTS.SNAKE_MOVED
			| typeof SNAKE_GAME_SOCKET_EVENTS.GAME_OVER,
		state: CoreSnakeGameState,
	) {
		this.server.to(roomId).emit(event, toSnakeGameStatePayload(state));
	}

	@SubscribeMessage(SNAKE_GAME_SOCKET_EVENTS.CHANGE_DIRECTION)
	async changeDirection(
		@ConnectedSocket() client: SocketWithAuth,
		@MessageBody(new ZodValidationPipe(SnakeChangeDirectionPayloadSchema))
		payload: SnakeChangeDirectionPayload,
	) {
		const userId = requireWsUser(client).sub;
		const participant = await this.roomsService.findMyParticipant(
			payload.roomId,
			userId,
		);
		if (!participant) {
			throw DomainError.accessDenied(
				`User is not a participant of room: ${payload.roomId}`,
			);
		}

		const direction: SnakeDirection = payload.direction;
		this.snakeService.changeDirection(
			payload.roomId,
			participant.id,
			direction,
		);
		return { ok: true, message: 'Direction changed!' };
	}

	@SubscribeMessage(SNAKE_GAME_SOCKET_EVENTS.CHANGE_SETTINGS)
	async changeSettings(
		@MessageBody(new ZodValidationPipe(SnakeChangeSettingsPayloadSchema))
		payload: SnakeChangeSettingsPayload,
	) {
		await this.roomSettingsService.updateSnakeSettings(
			payload.roomId,
			payload.settings,
		);

		const settingsChangedPayload: SnakeSettingsChangedPayload = {
			roomId: payload.roomId,
			settings: payload.settings,
		};

		this.server
			.to(payload.roomId)
			.emit(
				SNAKE_GAME_SOCKET_EVENTS.SETTINGS_CHANGED,
				settingsChangedPayload,
			);
		return { ok: true, message: 'Settings changed!' };
	}
}
