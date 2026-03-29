import type { SnakeGameState } from '@rooms/contracts/snake-game';
import type { SnakeGameState as CoreSnakeGameState } from './core';

export function toSnakeGameStatePayload(
	state: CoreSnakeGameState,
): SnakeGameState {
	return {
		snakeLength: state.snakeLength,
		snakeDirection: state.snakeDirection,
		snakePosition: {
			x: state.snakePosition.x,
			y: state.snakePosition.y,
		},
		foodPosition: {
			x: state.foodPosition.x,
			y: state.foodPosition.y,
		},
		gameOver: state.gameOver,
	};
}
