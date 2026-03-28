export const SNAKE_DIRECTION = {
	UP: 'up',
	DOWN: 'down',
	LEFT: 'left',
	RIGHT: 'right',
} as const;

export type SnakeDirection =
	(typeof SNAKE_DIRECTION)[keyof typeof SNAKE_DIRECTION];
