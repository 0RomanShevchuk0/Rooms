"use client";

import { useEffect } from "react";
import { useChatSocket } from "./stores/chat-socket";
import { useRoomsSocket } from "./stores/rooms-socket";

export function useSocketsConnect() {
	const chatConnect = useChatSocket((s) => s.connect);
	const chatDisconnect = useChatSocket((s) => s.disconnect);
	const roomsConnect = useRoomsSocket((s) => s.connect);
	const roomsDisconnect = useRoomsSocket((s) => s.disconnect);

	useEffect(() => {
		chatConnect();
		roomsConnect();

		return () => {
			chatDisconnect();
			roomsDisconnect();
		};
	}, [chatConnect, chatDisconnect, roomsConnect, roomsDisconnect]);
}
