"use client";

import {
	SNAKE_GAME_SOCKET_EVENTS,
	type SnakeChangeSettingsPayload,
	type SnakeSettingsChangedPayload,
} from "@rooms/contracts/snake-game";
import { useSnakeGameSocket } from "@/shared/lib/realtime/stores/snake-game-socket";
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SNAKE_FIELD_SIZE, type SnakeFieldSize } from "./constants";

interface UseRoomSnakeSettingsProps {
	roomId: string;
	initialFieldSize?: SnakeFieldSize;
}

interface RoomSnakeSettingsState {
	roomId: string;
	snakeFieldSizeOverride: SnakeFieldSize | null;
	isGameInProgress: boolean;
}

function createDefaultRoomState(roomId: string): RoomSnakeSettingsState {
	return {
		roomId,
		snakeFieldSizeOverride: null,
		isGameInProgress: false,
	};
}

export function useRoomSnakeSettings({ roomId, initialFieldSize }: UseRoomSnakeSettingsProps) {
	const { socket: snakeGameSocket } = useSnakeGameSocket();
	const [roomState, setRoomState] = useState<RoomSnakeSettingsState>(() =>
		createDefaultRoomState(roomId),
	);

	const currentRoomState =
		roomState.roomId === roomId ? roomState : createDefaultRoomState(roomId);

	const setCurrentRoomState = useCallback(
		(updater: (state: RoomSnakeSettingsState) => RoomSnakeSettingsState) => {
			setRoomState((previousState) => {
				const baseState =
					previousState.roomId === roomId ? previousState : createDefaultRoomState(roomId);
				return updater(baseState);
			});
		},
		[roomId],
	);

	useEffect(() => {
		const handleSettingsChanged = (payload: SnakeSettingsChangedPayload) => {
			if (payload.roomId !== roomId) {
				return;
			}

			setCurrentRoomState((state) => ({
				...state,
				snakeFieldSizeOverride: payload.settings.fieldSize,
			}));
		};

		snakeGameSocket.on(SNAKE_GAME_SOCKET_EVENTS.SETTINGS_CHANGED, handleSettingsChanged);

		return () => {
			snakeGameSocket.off(SNAKE_GAME_SOCKET_EVENTS.SETTINGS_CHANGED, handleSettingsChanged);
		};
	}, [snakeGameSocket, roomId, setCurrentRoomState]);

	useEffect(() => {
		const handleSnakeMoved = () => {
			setCurrentRoomState((state) => ({ ...state, isGameInProgress: true }));
		};
		const handleGameOver = () => {
			setCurrentRoomState((state) => ({ ...state, isGameInProgress: false }));
		};

		snakeGameSocket.on(SNAKE_GAME_SOCKET_EVENTS.SNAKE_MOVED, handleSnakeMoved);
		snakeGameSocket.on(SNAKE_GAME_SOCKET_EVENTS.GAME_OVER, handleGameOver);

		return () => {
			snakeGameSocket.off(SNAKE_GAME_SOCKET_EVENTS.SNAKE_MOVED, handleSnakeMoved);
			snakeGameSocket.off(SNAKE_GAME_SOCKET_EVENTS.GAME_OVER, handleGameOver);
		};
	}, [snakeGameSocket, setCurrentRoomState]);

	const snakeFieldSize =
		currentRoomState.snakeFieldSizeOverride ?? initialFieldSize ?? DEFAULT_SNAKE_FIELD_SIZE;

	const changeFieldSize = (fieldSize: SnakeFieldSize) => {
		const payload: SnakeChangeSettingsPayload = {
			roomId,
			settings: {
				fieldSize,
			},
		};

		snakeGameSocket.emit(SNAKE_GAME_SOCKET_EVENTS.CHANGE_SETTINGS, payload);
	};

	return {
		snakeFieldSize,
		isGameInProgress: currentRoomState.isGameInProgress,
		changeFieldSize,
	};
}
