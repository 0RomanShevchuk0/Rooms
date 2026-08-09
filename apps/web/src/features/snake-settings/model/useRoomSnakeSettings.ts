"use client";

import {
	SNAKE_GAME_SOCKET_EVENTS,
	type SnakeChangeSettingsPayload,
	type SnakeGameSettings,
	type SnakeSettingsChangedPayload,
} from "@rooms/contracts/snake-game";
import { useSnakeGameSocket } from "@/shared/lib/realtime/stores/snake-game-socket";
import { useCallback, useEffect, useState } from "react";
import {
	DEFAULT_SNAKE_GAME_SETTINGS,
	type SnakeFieldSize,
	type SnakeFoodAmount,
} from "./constants";

interface UseRoomSnakeSettingsProps {
	roomId: string;
	initialSettings?: SnakeGameSettings;
	/** Comes from the room phase; the client no longer guesses from game events. */
	isGameRunning: boolean;
}

interface RoomSnakeSettingsState {
	roomId: string;
	snakeSettingsOverride: SnakeGameSettings | null;
}

export interface RoomSnakeSettingsActions {
	setSettings: (settings: SnakeGameSettings) => void;
	setFieldSize: (fieldSize: SnakeFieldSize) => void;
	setFoodAmount: (foodAmount: SnakeFoodAmount) => void;
}

export interface RoomSnakeSettingsModel {
	snakeSettings: SnakeGameSettings;
	isGameInProgress: boolean;
	actions: RoomSnakeSettingsActions;
}

function createDefaultRoomState(roomId: string): RoomSnakeSettingsState {
	return {
		roomId,
		snakeSettingsOverride: null,
	};
}

export function useRoomSnakeSettings({
	roomId,
	initialSettings,
	isGameRunning,
}: UseRoomSnakeSettingsProps): RoomSnakeSettingsModel {
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
				snakeSettingsOverride: payload.settings,
			}));
		};

		snakeGameSocket.on(SNAKE_GAME_SOCKET_EVENTS.SETTINGS_CHANGED, handleSettingsChanged);

		return () => {
			snakeGameSocket.off(SNAKE_GAME_SOCKET_EVENTS.SETTINGS_CHANGED, handleSettingsChanged);
		};
	}, [snakeGameSocket, roomId, setCurrentRoomState]);

	const snakeSettings =
		currentRoomState.snakeSettingsOverride ?? initialSettings ?? DEFAULT_SNAKE_GAME_SETTINGS;

	const setSettings = useCallback((settings: SnakeGameSettings) => {
		const payload: SnakeChangeSettingsPayload = {
			roomId,
			settings,
		};

		snakeGameSocket.emit(SNAKE_GAME_SOCKET_EVENTS.CHANGE_SETTINGS, payload);
	}, [roomId, snakeGameSocket]);

	const setFieldSize = useCallback((fieldSize: SnakeFieldSize) => {
		setSettings({
			fieldSize,
			foodAmount: snakeSettings.foodAmount,
		});
	}, [setSettings, snakeSettings.foodAmount]);

	const setFoodAmount = useCallback((foodAmount: SnakeFoodAmount) => {
		setSettings({
			fieldSize: snakeSettings.fieldSize,
			foodAmount,
		});
	}, [setSettings, snakeSettings.fieldSize]);

	return {
		snakeSettings,
		isGameInProgress: isGameRunning,
		actions: {
			setSettings,
			setFieldSize,
			setFoodAmount,
		},
	};
}
