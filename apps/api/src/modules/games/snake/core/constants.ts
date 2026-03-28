import { SNAKE_DIRECTION, type SnakeDirection } from './direction';
import type { Position } from './types';

export const directionPositions: Record<SnakeDirection, Position> = {
	[SNAKE_DIRECTION.UP]: { x: 0, y: -1 },
	[SNAKE_DIRECTION.DOWN]: { x: 0, y: 1 },
	[SNAKE_DIRECTION.LEFT]: { x: -1, y: 0 },
	[SNAKE_DIRECTION.RIGHT]: { x: 1, y: 0 },
};
