"use client";

import { useRoomsSocket } from "@/shared/lib/realtime";
import type { RoomWithParticipantsAndChat } from "@rooms/contracts/room";
import { queryKeys } from "@/shared/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
	ROOM_SOCKET_EVENTS,
	type RoomParticipantJoinedPayload,
	type RoomPresencePayload,
} from "@rooms/contracts/room";

interface UseRoomPresenceProps {
	roomId: string;
}

export function useRoomPresence({ roomId }: UseRoomPresenceProps) {
	const queryClient = useQueryClient();
	const { socket } = useRoomsSocket();
	const [onlineParticipantIds, setOnlineParticipantIds] = useState<Set<string>>(new Set());

	useEffect(() => {
		const onJoined = (data: RoomParticipantJoinedPayload) => {
			queryClient.setQueryData<RoomWithParticipantsAndChat>(queryKeys.rooms.byId(roomId), (old) => {
				if (!old) return old;
				if (old.participants.some((p) => p.id === data.participant.id)) return old;
				return { ...old, participants: [...old.participants, data.participant] };
			});
			setOnlineParticipantIds(new Set(data.onlineParticipantIds));
		};

		const onLeft = (data: RoomPresencePayload) => {
			queryClient.setQueryData<RoomWithParticipantsAndChat>(queryKeys.rooms.byId(roomId), (old) => {
				if (!old) return old;
				if (!old.participants.some((p) => p.id === data.participantId)) return old;
				return { ...old, participants: old.participants.filter((p) => p.id !== data.participantId) };
			});
			setOnlineParticipantIds(new Set(data.onlineParticipantIds));
		};

		const onConnected = (data: RoomPresencePayload) => {
			setOnlineParticipantIds(new Set(data.onlineParticipantIds));
		};

		const onDisconnected = (data: RoomPresencePayload) => {
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
