export const SNAKE_GAME_SOCKET_EVENTS = {
	CONNECT: "snake-game:connect",
	DISCONNECT: "snake-game:disconnect",
	SNAKE_MOVED: "snake-game:snake-moved",
	GAME_OVER: "snake-game:game-over",
	START_GAME: "snake-game:start-game",
	CHANGE_DIRECTION: "snake-game:change-direction",
} as const;
