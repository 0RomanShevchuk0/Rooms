import type { SnakeGameState } from '@rooms/contracts/snake-game';
import { SnakeGameState as CoreSnakeGameState } from './core/types';

export function toSnakeGameStatePayload(
	state: CoreSnakeGameState,
): SnakeGameState {
	return {
		snakes: state.snakes.map((snake) => ({
			participantId: snake.participantId,
			direction: snake.direction,
			segments: snake.segments.map((segment) => ({
				x: segment.x,
				y: segment.y,
			})),
			alive: snake.alive,
		})),
		foodPositions: state.foodPositions.map((position) => ({
			x: position.x,
			y: position.y,
		})),
		gameOver: state.gameOver,
	};
}
