"use client";

import { useEffect, useState } from "react";
import { useSnakeGameSocket } from "@/shared/lib/realtime";
import { SNAKE_GAME_SOCKET_EVENTS, type SnakeGameState } from "@rooms/contracts/snake-game";

export interface SnakePlayerStat {
	length: number;
	alive: boolean;
	color: string;
}

export type SnakePlayerStats = Record<string, SnakePlayerStat>;

interface UseSnakePlayerStatsProps {
	roomId: string;
}

function toPlayerStats(gameState: SnakeGameState): SnakePlayerStats {
	return Object.fromEntries(
		gameState.snakes.map((snake) => [
			snake.participantId,
			{ length: snake.segments.length, alive: snake.alive, color: snake.color },
		]),
	);
}

export function useSnakePlayerStats({ roomId }: UseSnakePlayerStatsProps): SnakePlayerStats {
	const { socket } = useSnakeGameSocket();
	const [state, setState] = useState<{ roomId: string; stats: SnakePlayerStats }>({
		roomId,
		stats: {},
	});

	useEffect(() => {
		const handleGameState = (gameState: SnakeGameState) => {
			setState({ roomId, stats: toPlayerStats(gameState) });
		};

		socket.on(SNAKE_GAME_SOCKET_EVENTS.SNAKE_MOVED, handleGameState);
		socket.on(SNAKE_GAME_SOCKET_EVENTS.GAME_OVER, handleGameState);

		return () => {
			socket.off(SNAKE_GAME_SOCKET_EVENTS.SNAKE_MOVED, handleGameState);
			socket.off(SNAKE_GAME_SOCKET_EVENTS.GAME_OVER, handleGameState);
		};
	}, [socket, roomId]);

	return state.roomId === roomId ? state.stats : {};
}
