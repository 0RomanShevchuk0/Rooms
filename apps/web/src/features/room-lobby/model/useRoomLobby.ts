"use client";

import { useRoomsSocket } from "@/shared/lib/realtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ROOM_SOCKET_EVENTS,
	RoomPhaseEnum,
	type RoomLobbyStatePayload,
	type RoomSetReadyPayload,
	type RoomStartNowPayload,
} from "@rooms/contracts/room";

interface UseRoomLobbyProps {
	roomId: string;
	ownParticipantId: string | null;
}

export interface RoomLobbyModel {
	phase: RoomPhaseEnum;
	readyParticipantIds: Set<string>;
	/** Only counts during the gathering window; null the rest of the time. */
	windowSecondsLeft: number | null;
	isOwnReady: boolean;
	isGameRunning: boolean;
	setReady: (isReady: boolean) => void;
	startNow: () => void;
}

const EMPTY_LOBBY_STATE: RoomLobbyStatePayload = {
	phase: RoomPhaseEnum.LOBBY,
	readyParticipantIds: [],
	windowSecondsLeft: null,
};

/** The room phase comes from the server; nothing here is inferred from the game. */
export function useRoomLobby({ roomId, ownParticipantId }: UseRoomLobbyProps): RoomLobbyModel {
	const { socket } = useRoomsSocket();
	const [lobbyState, setLobbyState] = useState<RoomLobbyStatePayload>(EMPTY_LOBBY_STATE);

	useEffect(() => {
		const handleLobbyState = (state: RoomLobbyStatePayload) => {
			setLobbyState(state);
		};

		socket.on(ROOM_SOCKET_EVENTS.LOBBY_STATE, handleLobbyState);

		return () => {
			socket.off(ROOM_SOCKET_EVENTS.LOBBY_STATE, handleLobbyState);
			setLobbyState(EMPTY_LOBBY_STATE);
		};
	}, [socket, roomId]);

	const setReady = useCallback(
		(isReady: boolean) => {
			const payload: RoomSetReadyPayload = { roomId, isReady };
			socket.emit(ROOM_SOCKET_EVENTS.SET_READY, payload);
		},
		[roomId, socket],
	);

	const startNow = useCallback(() => {
		const payload: RoomStartNowPayload = { roomId };
		socket.emit(ROOM_SOCKET_EVENTS.START_NOW, payload);
	}, [roomId, socket]);

	const readyParticipantIds = useMemo(
		() => new Set(lobbyState.readyParticipantIds),
		[lobbyState.readyParticipantIds],
	);

	return {
		phase: lobbyState.phase,
		readyParticipantIds,
		windowSecondsLeft: lobbyState.windowSecondsLeft,
		isOwnReady: ownParticipantId !== null && readyParticipantIds.has(ownParticipantId),
		isGameRunning: lobbyState.phase === RoomPhaseEnum.RUNNING,
		setReady,
		startNow,
	};
}
