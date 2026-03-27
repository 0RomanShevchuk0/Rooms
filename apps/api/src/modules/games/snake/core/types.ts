export enum DirectionEnum {
	UP = 'up',
	DOWN = 'down',
	LEFT = 'left',
	RIGHT = 'right',
}

export type Position = {
	x: number;
	y: number;
};

export interface SnakeGameState {
	snakeLength: number;
	snakeDirection: DirectionEnum;
	snakePosition: Position;
	foodPosition: Position;
	gameOver: boolean;
}
