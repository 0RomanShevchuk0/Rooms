import type { SnakeGameSettings } from '@rooms/contracts/snake-game';
import { DEFAULT_SNAKE_GAME_SETTINGS } from './room-settings.constants';

type RoomSnakeSettingsEntity =
	| {
			fieldWidth: number;
			fieldHeight: number;
			foodAmount: number;
			speed: number;
	  }
	| null
	| undefined;

export function toSnakeGameSettings(
	settings: RoomSnakeSettingsEntity,
): SnakeGameSettings {
	return {
		fieldSize: {
			width:
				settings?.fieldWidth ?? DEFAULT_SNAKE_GAME_SETTINGS.fieldSize.width,
			height:
				settings?.fieldHeight ??
				DEFAULT_SNAKE_GAME_SETTINGS.fieldSize.height,
		},
		foodAmount:
			settings?.foodAmount ?? DEFAULT_SNAKE_GAME_SETTINGS.foodAmount,
		speed: settings?.speed ?? DEFAULT_SNAKE_GAME_SETTINGS.speed,
	};
}
