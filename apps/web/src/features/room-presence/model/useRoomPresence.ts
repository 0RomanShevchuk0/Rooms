"use client";

import { useRoomsSocket } from "@/app/_providers/ws";
import { ROOM_SOCKET_EVENTS, type RoomWithPlayers } from "@/entities/room";
import type { User } from "@/entities/user";
import { queryKeys } from "@/shared/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

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

		const onJoined = (data: { player: User }) => {
			queryClient.setQueryData<RoomWithPlayers>(queryKeys.rooms.byId(roomId), (old) => {
				if (!old) return old;
				if (old.players.some((p) => p.id === data.player.id)) return old;
				return { ...old, players: [...old.players, data.player] };
			});
			setOnlinePlayerIds((prev) => {
				const next = new Set(prev);
				next.add(data.player.id);
				return next;
			});
		};

		const onLeft = (data: { player: User }) => {
			queryClient.setQueryData<RoomWithPlayers>(queryKeys.rooms.byId(roomId), (old) => {
				if (!old) return old;
				if (!old.players.some((p) => p.id === data.player.id)) return old;
				return { ...old, players: old.players.filter((p) => p.id !== data.player.id) };
			});
			setOnlinePlayerIds((prev) => {
				const next = new Set(prev);
				next.delete(data.player.id);
				return next;
			});
		};

		socket.emit(ROOM_SOCKET_EVENTS.CONNECT, { roomId, playerId: userId });
		socket.on(ROOM_SOCKET_EVENTS.PLAYER_JOINED, onJoined);
		socket.on(ROOM_SOCKET_EVENTS.PLAYER_LEFT, onLeft);

		return () => {
			socket.emit(ROOM_SOCKET_EVENTS.DISCONNECT, { roomId, playerId: userId });
			socket.off(ROOM_SOCKET_EVENTS.PLAYER_JOINED, onJoined);
			socket.off(ROOM_SOCKET_EVENTS.PLAYER_LEFT, onLeft);
			setOnlinePlayerIds(new Set());
		};
	}, [socket, roomId, queryClient, userId]);

	return { onlinePlayerIds };
}
