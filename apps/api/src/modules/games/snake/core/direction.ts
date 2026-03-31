export const SNAKE_DIRECTION = {
	UP: 'up',
	DOWN: 'down',
	LEFT: 'left',
	RIGHT: 'right',
} as const;

export type SnakeDirection =
	(typeof SNAKE_DIRECTION)[keyof typeof SNAKE_DIRECTION];

export const directionOpposites: Record<SnakeDirection, SnakeDirection> = {
	[SNAKE_DIRECTION.UP]: SNAKE_DIRECTION.DOWN,
	[SNAKE_DIRECTION.DOWN]: SNAKE_DIRECTION.UP,
	[SNAKE_DIRECTION.LEFT]: SNAKE_DIRECTION.RIGHT,
	[SNAKE_DIRECTION.RIGHT]: SNAKE_DIRECTION.LEFT,
};
