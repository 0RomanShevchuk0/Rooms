import type { SnakeDirection } from './direction';

export type Position = {
	x: number;
	y: number;
};

export interface SnakeGameState {
	snakeLength: number;
	snakeDirection: SnakeDirection;
	snakePosition: Position;
	foodPosition: Position;
	gameOver: boolean;
}
