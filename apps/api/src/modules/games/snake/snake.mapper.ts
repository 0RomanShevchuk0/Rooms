import type { SnakeGameState } from '@rooms/contracts/snake-game';
import { SnakeGameState as CoreSnakeGameState } from './core/types';

export function toSnakeGameStatePayload(
	state: CoreSnakeGameState,
): SnakeGameState {
	return {
		snakeDirection: state.snakeDirection,
		snakeSegments: state.snakeSegments.map((segment) => ({
			x: segment.x,
			y: segment.y,
		})),
		foodPositions: state.foodPositions.map((position) => ({
			x: position.x,
			y: position.y,
		})),
		gameOver: state.gameOver,
	};
}
