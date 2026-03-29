"use client";

import { useChatSocket, useRoomsSocket } from "@/shared/lib/realtime";
import { getMeRoomParticipant } from "@/entities/room";
import { queryKeys } from "@/shared/react-query";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSnakeGameSocket } from "@/shared/lib/realtime/stores/snake-game-socket";
import type { ChatConnectionPayload } from "@rooms/contracts/chat";
import { CHAT_SOCKET_EVENTS } from "@rooms/contracts/chat";
import { ROOM_SOCKET_EVENTS, type RoomConnectPayload } from "@rooms/contracts/room";
import { SNAKE_GAME_SOCKET_EVENTS, type SnakeRoomPayload } from "@rooms/contracts/snake-game";

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

		const roomConnectPayload: RoomConnectPayload = { roomId, participantId };
		const snakeRoomPayload: SnakeRoomPayload = { roomId };

		roomsSocket.emit(ROOM_SOCKET_EVENTS.CONNECT, roomConnectPayload);
		snakeGameSocket.emit(SNAKE_GAME_SOCKET_EVENTS.CONNECT, snakeRoomPayload);

		if (chatId) {
			const chatConnectPayload: ChatConnectionPayload = { chatId };
			chatSocket.emit(CHAT_SOCKET_EVENTS.CONNECT, chatConnectPayload);
		}

		return () => {
			roomsSocket.emit(ROOM_SOCKET_EVENTS.DISCONNECT);
			snakeGameSocket.emit(SNAKE_GAME_SOCKET_EVENTS.DISCONNECT, snakeRoomPayload);
			if (chatId) {
				const chatDisconnectPayload: ChatConnectionPayload = { chatId };
				chatSocket.emit(CHAT_SOCKET_EVENTS.DISCONNECT, chatDisconnectPayload);
			}
		};
	}, [chatId, chatSocket, participantId, roomId, roomsSocket, snakeGameSocket]);
}
