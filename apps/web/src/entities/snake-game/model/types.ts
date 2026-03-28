export enum SnakeDirectionEnum {
	UP = 'up',
	DOWN = 'down',
	LEFT = 'left',
	RIGHT = 'right',
}

export type SnakePosition = {
	x: number;
	y: number;
};

export interface SnakeGameState {
	snakeLength: number;
	snakeDirection: SnakeDirectionEnum;
	snakePosition: SnakePosition;
	foodPosition: SnakePosition;
	gameOver: boolean;
}
