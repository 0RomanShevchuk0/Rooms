"use client";

import { useRoomsSocket } from "@/shared/lib/realtime";
import type { RoomWithParticipants } from "@/entities/room";
import { queryKeys } from "@/shared/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { RoomParticipantJoinedData, RoomPresenceData } from "./types";
import { ROOM_SOCKET_EVENTS } from "@rooms/contracts/room";

interface UseRoomPresenceProps {
	roomId: string;
}

export function useRoomPresence({ roomId }: UseRoomPresenceProps) {
	const queryClient = useQueryClient();
	const { socket } = useRoomsSocket();
	const [onlineParticipantIds, setOnlineParticipantIds] = useState<Set<string>>(new Set());

	useEffect(() => {
		const onJoined = (data: RoomParticipantJoinedData) => {
			queryClient.setQueryData<RoomWithParticipants>(queryKeys.rooms.byId(roomId), (old) => {
				if (!old) return old;
				if (old.participants.some((p) => p.id === data.participant.id)) return old;
				return { ...old, participants: [...old.participants, data.participant] };
			});
			setOnlineParticipantIds(new Set(data.onlineParticipantIds));
		};

		const onLeft = (data: RoomPresenceData) => {
			queryClient.setQueryData<RoomWithParticipants>(queryKeys.rooms.byId(roomId), (old) => {
				if (!old) return old;
				if (!old.participants.some((p) => p.id === data.participantId)) return old;
				return { ...old, participants: old.participants.filter((p) => p.id !== data.participantId) };
			});
			setOnlineParticipantIds(new Set(data.onlineParticipantIds));
		};

		const onConnected = (data: RoomPresenceData) => {
			setOnlineParticipantIds(new Set(data.onlineParticipantIds));
		};

		const onDisconnected = (data: RoomPresenceData) => {
			setOnlineParticipantIds(new Set(data.onlineParticipantIds));
		};

		socket.on(ROOM_SOCKET_EVENTS.CONNECT, onConnected);
		socket.on(ROOM_SOCKET_EVENTS.DISCONNECT, onDisconnected);
		socket.on(ROOM_SOCKET_EVENTS.PARTICIPANT_JOINED, onJoined);
		socket.on(ROOM_SOCKET_EVENTS.PARTICIPANT_LEFT, onLeft);

		return () => {
			socket.off(ROOM_SOCKET_EVENTS.CONNECT, onConnected);
			socket.off(ROOM_SOCKET_EVENTS.DISCONNECT, onDisconnected);
			socket.off(ROOM_SOCKET_EVENTS.PARTICIPANT_JOINED, onJoined);
			socket.off(ROOM_SOCKET_EVENTS.PARTICIPANT_LEFT, onLeft);

			setOnlineParticipantIds(new Set());
		};
	}, [socket, roomId, queryClient]);

	return { onlineParticipantIds };
}
