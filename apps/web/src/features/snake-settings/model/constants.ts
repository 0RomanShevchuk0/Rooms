import type { SnakeGameSettings } from "@rooms/contracts/snake-game";

export type SnakeFieldSize = SnakeGameSettings["fieldSize"];
export type SnakeFoodAmount = SnakeGameSettings["foodAmount"];

export const DEFAULT_SNAKE_GAME_SETTINGS: SnakeGameSettings = {
	fieldSize: {
		width: 20,
		height: 20,
	},
	foodAmount: 1,
};

export const SNAKE_FIELD_SIZE_PRESETS = [
	{ width: 16, height: 16 },
	{ width: 20, height: 20 },
	{ width: 24, height: 24 },
	{ width: 30, height: 30 },
	{ width: 40, height: 40 },
	{ width: 50, height: 50 },
] as const satisfies readonly SnakeFieldSize[];

export const SNAKE_FOOD_AMOUNT_PRESETS = [
	1, 2, 3, 5, 6, 7, 8, 9,
] as const satisfies readonly SnakeFoodAmount[];

export const toPresetValue = (fieldSize: SnakeFieldSize) =>
	`${fieldSize.width}x${fieldSize.height}`;

export const parsePresetValue = (presetValue: string): SnakeFieldSize | null => {
	const [nextWidthRaw, nextHeightRaw] = presetValue.split("x");
	const nextWidth = Number(nextWidthRaw);
	const nextHeight = Number(nextHeightRaw);

	if (!Number.isInteger(nextWidth) || !Number.isInteger(nextHeight)) {
		return null;
	}

	return {
		width: nextWidth,
		height: nextHeight,
	};
};

export const parseFoodAmountPresetValue = (presetValue: string): SnakeFoodAmount | null => {
	const parsedFoodAmount = Number(presetValue);

	if (!Number.isInteger(parsedFoodAmount) || parsedFoodAmount < 1) {
		return null;
	}

	return parsedFoodAmount;
};
