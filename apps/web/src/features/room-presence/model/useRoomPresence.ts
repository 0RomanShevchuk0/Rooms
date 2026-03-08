"use client";

import { useRoomsSocket } from "@/app/_providers/ws";
import { ROOM_SOCKET_EVENTS, type RoomWithParticipants } from "@/entities/room";
import { queryKeys } from "@/shared/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { RoomParticipantJoinedData, RoomPresenceData } from "./types";

interface UseRoomPresenceProps {
	roomId: string;
	userId?: string;
}

export function useRoomPresence({ roomId, userId }: UseRoomPresenceProps) {
	const queryClient = useQueryClient();
	const { socket } = useRoomsSocket();
	const [onlineParticipantIds, setOnlineParticipantIds] = useState<Set<string>>(new Set());

	// todo: получать партисипанта через ендпоинт
	const participantId = queryClient
		.getQueryData<RoomWithParticipants>(queryKeys.rooms.byId(roomId))
		?.participants.find((p) => p.userId === userId)?.id;

	useEffect(() => {
		if (!userId) return;

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

		if (!participantId) return;
		socket.emit(ROOM_SOCKET_EVENTS.CONNECT, { roomId, participantId });

		socket.on(ROOM_SOCKET_EVENTS.CONNECT, onConnected);
		socket.on(ROOM_SOCKET_EVENTS.DISCONNECT, onDisconnected);
		socket.on(ROOM_SOCKET_EVENTS.PARTICIPANT_JOINED, onJoined);
		socket.on(ROOM_SOCKET_EVENTS.PARTICIPANT_LEFT, onLeft);

		return () => {
			socket.emit(ROOM_SOCKET_EVENTS.DISCONNECT);

			socket.off(ROOM_SOCKET_EVENTS.CONNECT, onConnected);
			socket.off(ROOM_SOCKET_EVENTS.DISCONNECT, onDisconnected);
			socket.off(ROOM_SOCKET_EVENTS.PARTICIPANT_JOINED, onJoined);
			socket.off(ROOM_SOCKET_EVENTS.PARTICIPANT_LEFT, onLeft);

			setOnlineParticipantIds(new Set());
		};
	}, [socket, roomId, queryClient, participantId]);

	return { onlineParticipantIds };
}
