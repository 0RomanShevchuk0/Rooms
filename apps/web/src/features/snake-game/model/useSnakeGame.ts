import { SnakeCanvasRenderer, type SnakeCanvasSize } from "../core";
import { useSnakeGameSocket } from "@/shared/lib/realtime/stores/snake-game-socket";
import { useCallback, useEffect, useRef, useState } from "react";
import { codeDirectionMap } from "./constansts";
import {
	SNAKE_GAME_SOCKET_EVENTS,
	type SnakeChangeDirectionPayload,
	type SnakeGameSettings,
	type SnakeGameState,
} from "@rooms/contracts/snake-game";

type SnakeFieldSize = SnakeGameSettings["fieldSize"];

interface UseSnakeGameProps {
	roomId: string;
	snakeFieldSize: SnakeFieldSize;
	ownParticipantId: string | null;
	isGameRunning: boolean;
}

interface SnakeGameRoomState {
	roomId: string;
	gameOverState: SnakeGameState | null;
}

function createDefaultGameState(roomId: string): SnakeGameRoomState {
	return {
		roomId,
		gameOverState: null,
	};
}

function readCanvasSize(container: HTMLElement): SnakeCanvasSize {
	// Whole pixels keep the 1px grid strokes crisp.
	return {
		width: Math.floor(container.clientWidth),
		height: Math.floor(container.clientHeight),
	};
}

function isEditableTarget(target: EventTarget | null): target is HTMLElement {
	if (!(target instanceof HTMLElement)) return false;
	const tagName = target.tagName.toLowerCase();
	return (
		tagName === "input" ||
		tagName === "textarea" ||
		tagName === "select" ||
		target.isContentEditable
	);
}

export function useSnakeGame({
	roomId,
	snakeFieldSize,
	ownParticipantId,
	isGameRunning,
}: UseSnakeGameProps) {
	const canvasContainerRef = useRef<HTMLDivElement>(null);
	const rendererRef = useRef<SnakeCanvasRenderer | null>(null);
	const [roomState, setRoomState] = useState<SnakeGameRoomState>(() =>
		createDefaultGameState(roomId),
	);
	const currentRoomState =
		roomState.roomId === roomId ? roomState : createDefaultGameState(roomId);
	const setCurrentRoomState = useCallback(
		(updater: (state: SnakeGameRoomState) => SnakeGameRoomState) => {
			setRoomState((previousState) => {
				const baseState =
					previousState.roomId === roomId ? previousState : createDefaultGameState(roomId);
				return updater(baseState);
			});
		},
		[roomId],
	);
	const isGameRunningRef = useRef(isGameRunning);
	const snakeFieldWidth = snakeFieldSize.width;
	const snakeFieldHeight = snakeFieldSize.height;

	const { socket: snakeGameSocket } = useSnakeGameSocket();

	useEffect(() => {
		isGameRunningRef.current = isGameRunning;
	}, [isGameRunning]);

	useEffect(() => {
		const canvasContainer = canvasContainerRef.current;
		if (!canvasContainer) return;

		const snakeGame = new SnakeCanvasRenderer({
			container: canvasContainer,
			size: readCanvasSize(canvasContainer),
			fieldSize: {
				width: snakeFieldWidth,
				height: snakeFieldHeight,
			},
		});

		rendererRef.current = snakeGame;

		const resizeObserver = new ResizeObserver(() => {
			const size = readCanvasSize(canvasContainer);
			if (size.width > 0 && size.height > 0) snakeGame.resize(size);
		});
		resizeObserver.observe(canvasContainer);

		const handleSnakeMoved = (gameState: SnakeGameState) => {
			snakeGame.render(gameState);
		};

		const handleGameOver = (gameState: SnakeGameState) => {
			setCurrentRoomState((state) => ({ ...state, gameOverState: gameState }));
			snakeGame.render(gameState);
		};

		snakeGameSocket.on(SNAKE_GAME_SOCKET_EVENTS.SNAKE_MOVED, handleSnakeMoved);
		snakeGameSocket.on(SNAKE_GAME_SOCKET_EVENTS.GAME_OVER, handleGameOver);

		const handleDirectionChange = (event: KeyboardEvent) => {
			if (!isGameRunningRef.current) return;
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

			resizeObserver.disconnect();
			rendererRef.current = null;
			snakeGame.destroy();
		};
	}, [
		snakeGameSocket,
		roomId,
		snakeFieldWidth,
		snakeFieldHeight,
		ownParticipantId,
		setCurrentRoomState,
	]);

	// The final frame stays on the field while the results are up; a clean
	// board afterwards, so the next lobby does not show last match's snakes.
	const closeGameOverModal = () => {
		setCurrentRoomState((state) => ({ ...state, gameOverState: null }));
		rendererRef.current?.clear();
	};

	return {
		canvasContainerRef,
		// The last match's result has nothing to say over a running one.
		gameOverState: isGameRunning ? null : currentRoomState.gameOverState,
		closeGameOverModal,
	};
}
