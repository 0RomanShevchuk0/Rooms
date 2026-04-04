import type { ClientMessage } from "@/entities/message";
import type { AppSocket } from "@/shared/lib/realtime/createSocket";
import {
	CHAT_SOCKET_EVENTS,
	ChatMessagePayloadSchema,
	type ChatMessagePayload,
	type ChatSendMessagePayload,
} from "@rooms/contracts/chat";
import type { WsErrorResponse } from "@rooms/contracts/ws";
import {
	getWsErrorMessage,
	getWsValidationIssues,
	isWsErrorResponse,
} from "@/shared/lib/realtime/ws-errors";
import toast from "react-hot-toast";

type ChatSender = ClientMessage["sender"] & { id: string };

interface UseSendChatMessageParams {
	chatId: string;
	socket: AppSocket;
	sender: ChatSender | null;
	addPendingMessage: (message: ClientMessage) => void;
	markPendingFailed: (messageId: string) => void;
	removePendingMessage: (messageId: string) => void;
	pushMessagesToCache: (messages: ClientMessage[]) => void;
	shouldScrollToBottomRef: React.RefObject<boolean>;
	restoreInput: (content: string) => void;
}

export function useSendChatMessage({
	chatId,
	socket,
	sender,
	addPendingMessage,
	markPendingFailed,
	removePendingMessage,
	pushMessagesToCache,
	shouldScrollToBottomRef,
	restoreInput,
}: UseSendChatMessageParams) {
	const sendMessage = (rawContent: string): boolean => {
		if (!sender?.id) return false;

		const content = rawContent.trim();
		if (!content) return false;

		const payload: ChatSendMessagePayload = { chatId, content };
		const optimisticId = crypto.randomUUID();

		const optimisticMessage: ClientMessage = {
			id: optimisticId,
			chatId,
			senderId: sender.id,
			sender,
			content,
			createdAt: new Date().toISOString(),
			clientStatus: "sending",
		};

		shouldScrollToBottomRef.current = true;
		addPendingMessage(optimisticMessage);

		socket.emit(
			CHAT_SOCKET_EVENTS.MESSAGE,
			payload,
			(response: ChatMessagePayload | WsErrorResponse) => {
				if (isWsErrorResponse(response)) {
					const firstIssue = getWsValidationIssues(response)[0];
					const validationMessage = firstIssue
						? firstIssue.path
							? `${firstIssue.path}: ${firstIssue.message}`
							: firstIssue.message
						: null;

					markPendingFailed(optimisticId);
					toast.error(validationMessage ?? getWsErrorMessage(response));
					restoreInput(content);
					return;
				}

				const parsedResponse = ChatMessagePayloadSchema.safeParse(response);
				if (!parsedResponse.success) {
					markPendingFailed(optimisticId);
					toast.error("Failed to send message");
					restoreInput(content);
					return;
				}

				removePendingMessage(optimisticId);
				pushMessagesToCache([parsedResponse.data]);
			},
		);

		return true;
	};

	return { sendMessage };
}
