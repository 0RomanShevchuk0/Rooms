import { SNAKE_GAME_SOCKET_EVENTS, SnakeGameState } from "@/entities/snake-game";
import { SnakeCanvasRenderer } from "../core";
import { useSnakeGameSocket } from "@/shared/lib/realtime/stores/snake-game-socket";
import { useEffect, useRef } from "react";
import { directionInputMap } from "./constansts";

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
			const direction = directionInputMap[event.key];
			console.log("🚀 ~ handleDirectionChange ~ event.key:", event.key);
			console.log("🚀 ~ RoomPage ~ direction:", direction);
			if (direction) {
				snakeGameSocket.emit(SNAKE_GAME_SOCKET_EVENTS.CHANGE_DIRECTION, { direction, roomId });
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
