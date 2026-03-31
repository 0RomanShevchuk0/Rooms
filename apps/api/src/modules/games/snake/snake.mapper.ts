import type { SnakeGameState } from '@rooms/contracts/snake-game';
import { SnakeGameStatePublic as CoreSnakeGameState } from './core/types';

export function toSnakeGameStatePayload(
	state: CoreSnakeGameState,
): SnakeGameState {
	return {
		snakeDirection: state.snakeDirection,
		snakeSegments: state.snakeSegments.map((segment) => ({
			x: segment.x,
			y: segment.y,
		})),
		foodPosition: {
			x: state.foodPosition.x,
			y: state.foodPosition.y,
		},
		gameOver: state.gameOver,
	};
}
