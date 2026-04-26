import type { SnakeDirection } from './direction';

export type FieldSize = {
	width: number;
	height: number;
};

export type SnakeGameSettings = {
	fieldSize: FieldSize;
};

export type Position = {
	x: number;
	y: number;
};

export interface SnakeGameState {
	snakeSegments: Position[];
	snakeDirection: SnakeDirection;
	foodPosition: Position;
	gameOver: boolean;
}
