"use client";

import { useChatSocket, useRoomsSocket } from "@/shared/lib/realtime";
import { CHAT_SOCKET_EVENTS } from "@/entities/chat/model/socket-events";
import { getMeRoomParticipant, ROOM_SOCKET_EVENTS } from "@/entities/room";
import { queryKeys } from "@/shared/react-query";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSnakeGameSocket } from "@/shared/lib/realtime/stores/snake-game-socket";
import { SNAKE_GAME_SOCKET_EVENTS } from "@/entities/snake-game";

interface UseRoomRealtimeChannelsProps {
	roomId: string;
	chatId?: string;
}

export function useRoomRealtimeChannels({ roomId, chatId }: UseRoomRealtimeChannelsProps) {
	const {
		socket: roomsSocket,
		connect: roomsConnect,
		disconnect: roomsDisconnect,
	} = useRoomsSocket();
	const { socket: chatSocket, connect: chatConnect, disconnect: chatDisconnect } = useChatSocket();
	const {
		socket: snakeGameSocket,
		connect: snakeGameConnect,
		disconnect: snakeGameDisconnect,
	} = useSnakeGameSocket();

	useEffect(() => {
		chatConnect();
		roomsConnect();
		snakeGameConnect();

		return () => {
			chatDisconnect();
			roomsDisconnect();
			snakeGameDisconnect();
		};
	}, [
		chatConnect,
		chatDisconnect,
		roomsConnect,
		roomsDisconnect,
		snakeGameConnect,
		snakeGameDisconnect,
	]);

	const { data: participant } = useQuery({
		queryKey: queryKeys.rooms.meRoomParticipant(roomId),
		queryFn: () => getMeRoomParticipant(roomId),
		enabled: Boolean(roomId),
	});
	const participantId = participant?.id;

	useEffect(() => {
		if (!participantId) return;

		roomsSocket.emit(ROOM_SOCKET_EVENTS.CONNECT, { roomId, participantId });
		snakeGameSocket.emit(SNAKE_GAME_SOCKET_EVENTS.CONNECT, { roomId });

		if (chatId) {
			chatSocket.emit(CHAT_SOCKET_EVENTS.CONNECT, { chatId });
		}

		return () => {
			roomsSocket.emit(ROOM_SOCKET_EVENTS.DISCONNECT);
			snakeGameSocket.emit(SNAKE_GAME_SOCKET_EVENTS.DISCONNECT, { roomId });
			if (chatId) {
				chatSocket.emit(CHAT_SOCKET_EVENTS.DISCONNECT, { chatId });
			}
		};
	}, [chatId, chatSocket, participantId, roomId, roomsSocket, snakeGameSocket]);
}
