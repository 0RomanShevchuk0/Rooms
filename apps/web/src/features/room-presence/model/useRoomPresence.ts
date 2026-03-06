"use client";

import { useRoomsSocket } from "@/app/_providers/ws";
import { ROOM_SOCKET_EVENTS, type RoomWithPlayers } from "@/entities/room";
import { queryKeys } from "@/shared/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { RoomPlayerJoinedData, RoomPresenceData } from "./types";

interface UseRoomPresenceProps {
	roomId: string;
	userId?: string;
}

export function useRoomPresence({ roomId, userId }: UseRoomPresenceProps) {
	const queryClient = useQueryClient();
	const { socket } = useRoomsSocket();
	const [onlinePlayerIds, setOnlinePlayerIds] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (!userId) return;

		const onJoined = (data: RoomPlayerJoinedData) => {
			queryClient.setQueryData<RoomWithPlayers>(queryKeys.rooms.byId(roomId), (old) => {
				if (!old) return old;
				if (old.players.some((p) => p.id === data.player.id)) return old;
				return { ...old, players: [...old.players, data.player] };
			});
			setOnlinePlayerIds(new Set(data.onlinePlayerIds));
		};

		const onLeft = (data: RoomPresenceData) => {
			queryClient.setQueryData<RoomWithPlayers>(queryKeys.rooms.byId(roomId), (old) => {
				if (!old) return old;
				if (!old.players.some((p) => p.id === data.playerId)) return old;
				return { ...old, players: old.players.filter((p) => p.id !== data.playerId) };
			});
			setOnlinePlayerIds(new Set(data.onlinePlayerIds));
		};

		const onConnected = (data: RoomPresenceData) => {
			setOnlinePlayerIds(new Set(data.onlinePlayerIds));
		};

		const onDisconnected = (data: RoomPresenceData) => {
			setOnlinePlayerIds(new Set(data.onlinePlayerIds));
		};

		socket.emit(ROOM_SOCKET_EVENTS.CONNECT, { roomId, playerId: userId });

		socket.on(ROOM_SOCKET_EVENTS.CONNECT, onConnected);
		socket.on(ROOM_SOCKET_EVENTS.DISCONNECT, onDisconnected);
		socket.on(ROOM_SOCKET_EVENTS.PLAYER_JOINED, onJoined);
		socket.on(ROOM_SOCKET_EVENTS.PLAYER_LEFT, onLeft);

		return () => {
			socket.emit(ROOM_SOCKET_EVENTS.DISCONNECT);

			socket.off(ROOM_SOCKET_EVENTS.CONNECT, onConnected);
			socket.off(ROOM_SOCKET_EVENTS.DISCONNECT, onDisconnected);
			socket.off(ROOM_SOCKET_EVENTS.PLAYER_JOINED, onJoined);
			socket.off(ROOM_SOCKET_EVENTS.PLAYER_LEFT, onLeft);

			setOnlinePlayerIds(new Set());
		};
	}, [socket, roomId, queryClient, userId]);

	return { onlinePlayerIds };
}
