import { SnakeCanvasRenderer } from "../core";
import { useSnakeGameSocket } from "@/shared/lib/realtime/stores/snake-game-socket";
import { useEffect, useRef } from "react";
import { codeDirectionMap } from "./constansts";
import {
	SNAKE_GAME_SOCKET_EVENTS,
	type SnakeChangeDirectionPayload,
	type SnakeGameState,
} from "@rooms/contracts/snake-game";

interface UseSnakeGameProps {
	roomId: string;
}

export function useSnakeGame({ roomId }: UseSnakeGameProps) {
	const canvasContainerRef = useRef<HTMLDivElement>(null);

	const { socket: snakeGameSocket } = useSnakeGameSocket();

	useEffect(() => {
		const canvasContainer = canvasContainerRef.current;
		if (!canvasContainer) return;

		const snakeGame = new SnakeCanvasRenderer({
			container: canvasContainer,
			width: 500,
			height: 500,
			fieldSize: 20,
		});

		const handleSnakeMoved = (gameState: SnakeGameState) => {
			console.log("Received game state update:", gameState);
			snakeGame.updateSnakePosition(gameState.snakePosition);
		};

		const handleGameOver = (gameState: SnakeGameState) => {
			alert("Game Over!");
			console.log("Game over state:", gameState);
		};

		snakeGameSocket.on(SNAKE_GAME_SOCKET_EVENTS.SNAKE_MOVED, handleSnakeMoved);
		snakeGameSocket.on(SNAKE_GAME_SOCKET_EVENTS.GAME_OVER, handleGameOver);

		const handleDirectionChange = (event: KeyboardEvent) => {
			const direction = codeDirectionMap[event.code];
			console.log("🚀 ~ handleDirectionChange ~ event.code:", event.code);
			console.log("🚀 ~ RoomPage ~ direction:", direction);
			if (direction) {
				const payload: SnakeChangeDirectionPayload = { direction, roomId };
				snakeGameSocket.emit(SNAKE_GAME_SOCKET_EVENTS.CHANGE_DIRECTION, payload);
			}
		};

		window.addEventListener("keydown", handleDirectionChange);

		return () => {
			snakeGameSocket.off(SNAKE_GAME_SOCKET_EVENTS.SNAKE_MOVED, handleSnakeMoved);
			snakeGameSocket.off(SNAKE_GAME_SOCKET_EVENTS.GAME_OVER, handleGameOver);

			window.removeEventListener("keydown", handleDirectionChange);

			snakeGame.destroy();
		};
	}, [snakeGameSocket, roomId]);

	return { canvasContainerRef };
}
