import { Injectable } from '@nestjs/common';
import { type SnakeDirection, SnakeGame } from './core';
import { DomainError } from 'src/shared/errors/domain.error';

@Injectable()
export class SnakeService {
	private roomGameMap = new Map<string, SnakeGame>();

	startGame(roomId: string) {
		const existingGame = this.roomGameMap.get(roomId);
		existingGame?.dispose();

		const game = new SnakeGame();
		this.roomGameMap.set(roomId, game);
		game.startGame();
		return game;
	}

	changeDirection(roomId: string, direction: SnakeDirection) {
		const game = this.getGameByRoomIdOrThrow(roomId);
		game.changeDirection(direction);
	}

	private getGameByRoomIdOrThrow(roomId: string): SnakeGame {
		const game = this.roomGameMap.get(roomId);
		if (!game) {
			throw DomainError.notFound(`Game not found for roomId: ${roomId}`);
		}
		return game;
	}
}
