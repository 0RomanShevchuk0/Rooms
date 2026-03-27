import { Injectable } from '@nestjs/common';
import { DirectionEnum, Position, SnakeGame } from './core';
import { DomainError } from 'src/shared/errors/domain.error';

@Injectable()
export class SnakeService {
	private roomGameMap = new Map<string, SnakeGame>();

	startGame(
		roomId: string,
		onMove: (position: Position) => void,
		onGameOver: () => void,
	) {
		const game = new SnakeGame(onMove, onGameOver);
		this.roomGameMap.set(roomId, game);
		game.startGame();
	}

	changeDirection(roomId: string, direction: DirectionEnum) {
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
