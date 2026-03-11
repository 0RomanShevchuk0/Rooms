"use client";

import { useChatSocket, useRoomsSocket } from "@/app/_providers/ws";
import { CHAT_SOCKET_EVENTS } from "@/entities/chat/model/socket-events";
import { getMeRoomParticipant, ROOM_SOCKET_EVENTS } from "@/entities/room";
import { queryKeys } from "@/shared/react-query";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface UseRoomRealtimeChannelsProps {
	roomId: string;
	chatId?: string;
	userId?: string;
}

export function useRoomRealtimeChannels({ roomId, chatId, userId }: UseRoomRealtimeChannelsProps) {
	const { socket: roomsSocket } = useRoomsSocket();
	const { socket: chatSocket } = useChatSocket();

	const { data: participant } = useQuery({
		queryKey: queryKeys.rooms.meRoomParticipant(roomId),
		queryFn: () => getMeRoomParticipant(roomId),
		enabled: Boolean(roomId && userId),
	});
	const participantId = participant?.id;

	useEffect(() => {
		if (!userId || !participantId) return;

		roomsSocket.emit(ROOM_SOCKET_EVENTS.CONNECT, { roomId, participantId });
		if (chatId) {
			chatSocket.emit(CHAT_SOCKET_EVENTS.CONNECT, { chatId });
		}

		return () => {
			roomsSocket.emit(ROOM_SOCKET_EVENTS.DISCONNECT);
			if (chatId) {
				chatSocket.emit(CHAT_SOCKET_EVENTS.DISCONNECT, { chatId });
			}
		};
	}, [chatId, chatSocket, participantId, roomId, roomsSocket, userId]);
}
