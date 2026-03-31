import type { SnakeDirection } from './direction';

export type Position = {
	x: number;
	y: number;
};

export interface SnakeGameState {
	snakeSegments: Position[];
	snakeDirection: SnakeDirection;
	gameOver: boolean;
}

export interface SnakeGameStatePublic {
	snakeSegments: Position[];
	snakeDirection: SnakeDirection;
	foodPosition: Position;
	gameOver: boolean;
}
