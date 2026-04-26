import type { SnakeGameSettings } from "@rooms/contracts/snake-game";

export type SnakeFieldSize = SnakeGameSettings["fieldSize"];

export const DEFAULT_SNAKE_FIELD_SIZE: SnakeFieldSize = {
	width: 20,
	height: 20,
};

export const SNAKE_FIELD_SIZE_PRESETS = [
	{ width: 16, height: 16 },
	{ width: 20, height: 20 },
	{ width: 24, height: 24 },
	{ width: 28, height: 20 },
	{ width: 20, height: 28 },
] as const satisfies readonly SnakeFieldSize[];

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
