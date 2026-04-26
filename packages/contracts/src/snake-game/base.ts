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
});

export const SnakeGameStateSchema = z.object({
	snakeDirection: SnakeDirectionSchema,
	snakeSegments: z.array(SnakePositionSchema),
	foodPosition: SnakePositionSchema,
	gameOver: z.boolean(),
});

export type SnakeDirection = z.infer<typeof SnakeDirectionSchema>;
export type SnakePosition = z.infer<typeof SnakePositionSchema>;
export type SnakeGameState = z.infer<typeof SnakeGameStateSchema>;
export type SnakeFieldSize = z.infer<typeof SnakeFieldSizeSchema>;
export type SnakeGameSettings = z.infer<typeof SnakeGameSettingsSchema>;
