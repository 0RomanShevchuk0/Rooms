import { z } from "zod";
import { SnakeDirectionSchema } from "./model.js";

export const SNAKE_GAME_SOCKET_EVENTS = {
	CONNECT: "snake-game:connect",
	DISCONNECT: "snake-game:disconnect",
	START_GAME: "snake-game:start-game",
	CHANGE_DIRECTION: "snake-game:change-direction",
	GAME_OVER: "snake-game:game-over",
	SNAKE_MOVED: "snake-game:snake-moved",
} as const;

export const SnakeRoomPayloadSchema = z.object({
	roomId: z.string().uuid(),
});

export const SnakeChangeDirectionPayloadSchema = z.object({
	roomId: z.string().uuid(),
	direction: SnakeDirectionSchema,
});

export type SnakeRoomPayload = z.infer<typeof SnakeRoomPayloadSchema>;
export type SnakeChangeDirectionPayload = z.infer<
	typeof SnakeChangeDirectionPayloadSchema
>;
