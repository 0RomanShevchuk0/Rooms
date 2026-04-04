import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { SendHorizonal } from "lucide-react";
import { useChatSocket } from "@/shared/lib/realtime";
import { useRef, useState } from "react";
import type { ClientMessage } from "@/entities/message";
import {
	CHAT_SOCKET_EVENTS,
	ChatMessagePayloadSchema,
	type ChatSendMessagePayload,
	type ChatMessagePayload,
} from "@rooms/contracts/chat";
import type { WsErrorResponse } from "@rooms/contracts/ws";
import { useMeQuery } from "@/entities/user/model/useMeQuery";
import { Message } from "./Message";
import { useMessagesSocket } from "../model/useMessagesSocket";
import { useMessages } from "../model/useMessages";
import { useChatScrollToBottom } from "../model/useChatScrollToBottom";
import { useChatScrollPagination } from "../model/useChatScrollPagination";
import toast from "react-hot-toast";
import {
	getWsErrorMessage,
	getWsValidationIssues,
	isWsErrorResponse,
} from "@/shared/lib/realtime/ws-errors";

interface ChatProps {
	chatId: string;
}

export function Chat({ chatId }: ChatProps) {
	const { user } = useMeQuery();

	const [message, setMessage] = useState("");
	const shouldScrollToBottomRef = useRef(true);
	const chatContainerRef = useRef<HTMLDivElement | null>(null);
	const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

	const { socket } = useChatSocket();

	const {
		messages,
		hasNextPage,
		isFetchingNextPage,
		pushMessagesToCache,
		fetchNextPage,
		setMessageClientStatus,
		replaceMessageInCache,
	} = useMessages({ chatId });
	useMessagesSocket({ onMessage: (m) => pushMessagesToCache([m]) });
	useChatScrollToBottom({ messages, chatContainerRef, shouldScrollToBottomRef });
	useChatScrollPagination({
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		chatContainerRef,
		sentinel,
		messagesCount: messages.length,
	});

	const handleSendMessage = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!user?.id) return;
		const content = message.trim();
		if (!content) return;
		const payload: ChatSendMessagePayload = { chatId, content };

		setMessage("");
		const optimisticId = `optimistic-${Date.now()}`;

		const optimisticMessage: ClientMessage = {
			id: optimisticId,
			chatId,
			senderId: user.id,
			sender: user,
			content,
			createdAt: new Date().toISOString(),
			clientStatus: "sending",
		};

		shouldScrollToBottomRef.current = true;
		pushMessagesToCache([optimisticMessage]);

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

					setMessageClientStatus(optimisticId, "failed");
					toast.error(validationMessage ?? getWsErrorMessage(response));
					setMessage((prev) => prev || content);
					return;
				}

				const parsedResponse = ChatMessagePayloadSchema.safeParse(response);
				if (!parsedResponse.success) {
					setMessageClientStatus(optimisticId, "failed");
					toast.error("Failed to send message");
					setMessage((prev) => prev || content);
					return;
				}

				replaceMessageInCache(optimisticId, parsedResponse.data);
			},
		);
	};

	return (
		<div className="h-full flex flex-col content-between gap-2">
			<div
				ref={chatContainerRef}
				className="min-h-0 flex-1 rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground overflow-auto"
			>
				{messages?.length ? (
					<div className="flex flex-col-reverse gap-2">
						{messages.map((message) => (
							<Message key={message.id} message={message} />
						))}
						<div ref={setSentinel} />
					</div>
				) : (
					<div className="w-full h-full flex items-center justify-center text-center text-sm text-muted-foreground">
						No messages yet
					</div>
				)}
			</div>
			<form className="flex gap-1" onSubmit={handleSendMessage}>
				<Input
					type="text"
					placeholder="Type your message here..."
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
				<Button type="submit">
					<SendHorizonal />
				</Button>
			</form>
		</div>
	);
}
