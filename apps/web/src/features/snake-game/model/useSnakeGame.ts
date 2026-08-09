import { SnakeCanvasRenderer } from "../core";
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
	snakeLength: number;
}

function createDefaultGameState(roomId: string): SnakeGameRoomState {
	return {
		roomId,
		gameOverState: null,
		snakeLength: 1,
	};
}

function getOwnSnakeLength(gameState: SnakeGameState, ownParticipantId: string | null) {
	const ownSnake = gameState.snakes.find((snake) => snake.participantId === ownParticipantId);
	return ownSnake?.segments.length ?? 0;
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
			width: 500,
			height: 500,
			fieldSize: {
				width: snakeFieldWidth,
				height: snakeFieldHeight,
			},
			ownParticipantId,
		});

		const handleSnakeMoved = (gameState: SnakeGameState) => {
			setCurrentRoomState((state) => ({
				...state,
				snakeLength: getOwnSnakeLength(gameState, ownParticipantId),
			}));
			snakeGame.render(gameState);
		};

		const handleGameOver = (gameState: SnakeGameState) => {
			setCurrentRoomState((state) => ({
				...state,
				snakeLength: getOwnSnakeLength(gameState, ownParticipantId),
				gameOverState: gameState,
			}));
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

	const closeGameOverModal = () => {
		setCurrentRoomState((state) => ({ ...state, gameOverState: null }));
	};

	return {
		canvasContainerRef,
		snakeLength: currentRoomState.snakeLength,
		// The last match's result has nothing to say over a running one.
		gameOverState: isGameRunning ? null : currentRoomState.gameOverState,
		closeGameOverModal,
	};
}
