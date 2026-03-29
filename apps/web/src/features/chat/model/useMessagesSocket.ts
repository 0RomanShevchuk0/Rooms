import { useChatSocket } from "@/shared/lib/realtime";
import { CHAT_SOCKET_EVENTS, type ChatMessagePayload } from "@rooms/contracts/chat";
import { useEffect } from "react";

interface UseMessagesSocketProps {
	onMessage: (message: ChatMessagePayload) => void;
}

export function useMessagesSocket({ onMessage }: UseMessagesSocketProps) {
	const { socket } = useChatSocket();

	useEffect(() => {
		socket.on(CHAT_SOCKET_EVENTS.MESSAGE, onMessage);

		return () => {
			socket.off(CHAT_SOCKET_EVENTS.MESSAGE, onMessage);
		};
	}, [socket, onMessage]);
}
