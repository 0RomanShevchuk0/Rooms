import type { SnakeDirection } from './direction';

export type FieldSize = {
	width: number;
	height: number;
};

export type SnakeGameSettings = {
	foodAmount: number;
	fieldSize: FieldSize;
};

export type Position = {
	x: number;
	y: number;
};

export interface SnakePlayerState {
	participantId: string;
	direction: SnakeDirection;
	segments: Position[];
	alive: boolean;
}

export interface SnakeGameState {
	snakes: SnakePlayerState[];
	foodPositions: Position[];
	gameOver: boolean;
}
