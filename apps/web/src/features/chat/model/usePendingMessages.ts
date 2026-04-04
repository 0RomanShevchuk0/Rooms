import type { ClientMessage } from "@/entities/message";
import { useState } from "react";

export function usePendingMessages() {
	const [pendingMessages, setPendingMessages] = useState<ClientMessage[]>([]);

	const addPendingMessage = (message: ClientMessage) => {
		setPendingMessages((prev) => [message, ...prev]);
	};

	const markPendingFailed = (messageId: string) => {
		setPendingMessages((prev) =>
			prev.map((message) =>
				message.id === messageId ? { ...message, clientStatus: "failed" } : message,
			),
		);
	};

	const removePendingMessage = (messageId: string) => {
		setPendingMessages((prev) => prev.filter((message) => message.id !== messageId));
	};

	return {
		pendingMessages,
		addPendingMessage,
		markPendingFailed,
		removePendingMessage,
	};
}
