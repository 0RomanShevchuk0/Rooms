import { Injectable } from '@nestjs/common';
import { type SnakeDirection, SnakeGame } from './core';
import { DomainError } from 'src/shared/errors/domain.error';
import { RoomSettingsService } from 'src/modules/rooms/room-settings/room-settings.service';

@Injectable()
export class SnakeService {
	constructor(private readonly roomSettingsService: RoomSettingsService) {}

	private roomGameMap = new Map<string, SnakeGame>();

	async startGame(roomId: string) {
		const existingGame = this.roomGameMap.get(roomId);
		existingGame?.destroy();

		const settings =
			await this.roomSettingsService.getOrCreateSnakeSettings(roomId);
		const game = new SnakeGame(settings);
		this.roomGameMap.set(roomId, game);
		game.startGame();
		return game;
	}

	changeDirection(roomId: string, direction: SnakeDirection) {
		const game = this.getGameByRoomIdOrThrow(roomId);
		game.changeSnakeDirection(direction);
	}

	private getGameByRoomIdOrThrow(roomId: string): SnakeGame {
		const game = this.roomGameMap.get(roomId);
		if (!game) {
			throw DomainError.notFound(`Game not found for roomId: ${roomId}`);
		}
		return game;
	}
}
