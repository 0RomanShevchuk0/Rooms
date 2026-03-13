import { useChatSocket } from "@/app/_providers/ws";
import { CHAT_SOCKET_EVENTS } from "@/entities/chat/model/socket-events";
import { MessageWithSender } from "@/entities/message";
import { useEffect } from "react";

interface UseMessagesSocketProps {
	onMessage: (message: MessageWithSender) => void;
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
