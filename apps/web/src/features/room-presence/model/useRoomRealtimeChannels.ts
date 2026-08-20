"use client";

import { SYSTEM_SOCKET_EVENTS, useChatSocket, useRoomsSocket } from "@/shared/lib/realtime";
import { useMyRoomParticipantQuery } from "@/entities/room";
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

	const { participantId } = useMyRoomParticipantQuery(roomId);

	useEffect(() => {
		if (!participantId) return;

		const roomConnectPayload: RoomConnectPayload = { roomId, participantId };
		const snakeRoomPayload: SnakeRoomPayload = { roomId };

		const joinRoom = () => roomsSocket.emit(ROOM_SOCKET_EVENTS.CONNECT, roomConnectPayload);
		const joinSnakeGame = () =>
			snakeGameSocket.emit(SNAKE_GAME_SOCKET_EVENTS.CONNECT, snakeRoomPayload);
		const joinChat = () => {
			if (!chatId) return;
			const chatConnectPayload: ChatConnectionPayload = { chatId };
			chatSocket.emit(CHAT_SOCKET_EVENTS.CONNECT, chatConnectPayload);
		};

		joinRoom();
		joinSnakeGame();
		joinChat();

		// A reconnect comes back as a new socket the server has never seen, so the
		// room has to be joined again — otherwise presence and ready silently die.
		roomsSocket.on(SYSTEM_SOCKET_EVENTS.CONNECT, joinRoom);
		snakeGameSocket.on(SYSTEM_SOCKET_EVENTS.CONNECT, joinSnakeGame);
		chatSocket.on(SYSTEM_SOCKET_EVENTS.CONNECT, joinChat);

		return () => {
			roomsSocket.off(SYSTEM_SOCKET_EVENTS.CONNECT, joinRoom);
			snakeGameSocket.off(SYSTEM_SOCKET_EVENTS.CONNECT, joinSnakeGame);
			chatSocket.off(SYSTEM_SOCKET_EVENTS.CONNECT, joinChat);

			roomsSocket.emit(ROOM_SOCKET_EVENTS.DISCONNECT);
			snakeGameSocket.emit(SNAKE_GAME_SOCKET_EVENTS.DISCONNECT, snakeRoomPayload);
			if (chatId) {
				const chatDisconnectPayload: ChatConnectionPayload = { chatId };
				chatSocket.emit(CHAT_SOCKET_EVENTS.DISCONNECT, chatDisconnectPayload);
			}
		};
	}, [chatId, chatSocket, participantId, roomId, roomsSocket, snakeGameSocket]);
}
