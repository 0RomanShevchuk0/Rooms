import { z } from "zod";

export const SnakeDirectionEnum = {
	UP: "up",
	DOWN: "down",
	LEFT: "left",
	RIGHT: "right",
} as const;
export type SnakeDirectionEnum =
	(typeof SnakeDirectionEnum)[keyof typeof SnakeDirectionEnum];

export const SnakeDirectionSchema = z.enum([
	SnakeDirectionEnum.UP,
	SnakeDirectionEnum.DOWN,
	SnakeDirectionEnum.LEFT,
	SnakeDirectionEnum.RIGHT,
]);

export const SnakePositionSchema = z.object({
	x: z.number(),
	y: z.number(),
});

export const SnakeFieldSizeSchema = z.object({
	width: z.number().int().min(6).max(80),
	height: z.number().int().min(6).max(80),
});

export const SnakeGameSettingsSchema = z.object({
	fieldSize: SnakeFieldSizeSchema,
	foodAmount: z.number().int().min(1),
});

export const SnakePlayerStateSchema = z.object({
	participantId: z.uuid(),
	direction: SnakeDirectionSchema,
	segments: z.array(SnakePositionSchema),
	alive: z.boolean(),
});

export const SnakeGameStateSchema = z.object({
	snakes: z.array(SnakePlayerStateSchema),
	foodPositions: z.array(SnakePositionSchema),
	gameOver: z.boolean(),
});

export type SnakeDirection = z.infer<typeof SnakeDirectionSchema>;
export type SnakePosition = z.infer<typeof SnakePositionSchema>;
export type SnakePlayerState = z.infer<typeof SnakePlayerStateSchema>;
export type SnakeGameState = z.infer<typeof SnakeGameStateSchema>;
export type SnakeFieldSize = z.infer<typeof SnakeFieldSizeSchema>;
export type SnakeGameSettings = z.infer<typeof SnakeGameSettingsSchema>;
