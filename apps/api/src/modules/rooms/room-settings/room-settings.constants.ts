import type { SnakeGameSettings } from '@rooms/contracts/snake-game';

export const DEFAULT_SNAKE_GAME_SETTINGS: SnakeGameSettings = {
	fieldSize: {
		width: 20,
		height: 20,
	},
	foodAmount: 1,
};
