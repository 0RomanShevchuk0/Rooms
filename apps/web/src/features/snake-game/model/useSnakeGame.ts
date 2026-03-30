import { SnakeCanvasRenderer } from "../core";
import { useSnakeGameSocket } from "@/shared/lib/realtime/stores/snake-game-socket";
import { useEffect, useRef, useState } from "react";
import { codeDirectionMap } from "./constansts";
import {
	SNAKE_GAME_SOCKET_EVENTS,
	type SnakeRoomPayload,
	type SnakeChangeDirectionPayload,
	type SnakeGameState,
} from "@rooms/contracts/snake-game";

interface UseSnakeGameProps {
	roomId: string;
}

type SnakeGameStatus = "idle" | "running" | "over";

function isEditableTarget(target: EventTarget | null): target is HTMLElement {
	if (!(target instanceof HTMLElement)) return false;
	const tagName = target.tagName.toLowerCase();
	return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
}

export function useSnakeGame({ roomId }: UseSnakeGameProps) {
	const canvasContainerRef = useRef<HTMLDivElement>(null);
	const [gameOverState, setGameOverState] = useState<SnakeGameState | null>(null);
	const [snakeLength, setSnakeLength] = useState(1);
	const [gameStatus, setGameStatus] = useState<SnakeGameStatus>("idle");
	const gameStatusRef = useRef<SnakeGameStatus>("idle");

	const { socket: snakeGameSocket } = useSnakeGameSocket();

	useEffect(() => {
		gameStatusRef.current = gameStatus;
	}, [gameStatus]);

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
			setSnakeLength(gameState.snakeLength);
			setGameStatus("running");
			snakeGame.updateSnakePosition(gameState.snakePosition);
		};

		const handleGameOver = (gameState: SnakeGameState) => {
			setSnakeLength(gameState.snakeLength);
			setGameOverState(gameState);
			setGameStatus("over");
		};

		snakeGameSocket.on(SNAKE_GAME_SOCKET_EVENTS.SNAKE_MOVED, handleSnakeMoved);
		snakeGameSocket.on(SNAKE_GAME_SOCKET_EVENTS.GAME_OVER, handleGameOver);

		const handleDirectionChange = (event: KeyboardEvent) => {
			if (gameStatusRef.current !== "running") return;
			if (isEditableTarget(event.target)) return;

			const direction = codeDirectionMap[event.code];
			if (direction) {
				event.preventDefault();
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

	const closeGameOverModal = () => {
		setGameOverState(null);
		setGameStatus((currentStatus) => (currentStatus === "over" ? "idle" : currentStatus));
	};

	const startGame = () => {
		setGameOverState(null);
		setSnakeLength(1);
		setGameStatus("running");

		const payload: SnakeRoomPayload = { roomId };
		snakeGameSocket.emit(SNAKE_GAME_SOCKET_EVENTS.START_GAME, payload);
	};

	return {
		canvasContainerRef,
		snakeLength,
		gameStatus,
		gameOverState,
		closeGameOverModal,
		startGame,
	};
}
