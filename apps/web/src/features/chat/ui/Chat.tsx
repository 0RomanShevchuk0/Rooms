import { useChatSocket } from "@/shared/lib/realtime";
import { useMemo, useRef, useState } from "react";
import { useMeQuery } from "@/entities/user/model/useMeQuery";
import { useMessagesSocket } from "../model/useMessagesSocket";
import { useMessages } from "../model/useMessages";
import { usePendingMessages } from "../model/usePendingMessages";
import { useSendChatMessage } from "../model/useSendChatMessage";
import { useChatScrollToBottom } from "../model/useChatScrollToBottom";
import { useChatScrollPagination } from "../model/useChatScrollPagination";
import { ChatMessagesList } from "./ChatMessagesList";
import { ChatMessageForm } from "./ChatMessageForm";

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
		isPending,
		hasNextPage,
		isFetchingNextPage,
		pushMessagesToCache,
		fetchNextPage,
	} = useMessages({ chatId });
	const { pendingMessages, addPendingMessage, markPendingFailed, removePendingMessage } =
		usePendingMessages();
	const displayedMessages = useMemo(
		() => [...pendingMessages, ...messages],
		[pendingMessages, messages],
	);
	const isInitialLoading = isPending && displayedMessages.length === 0;
	const { sendMessage } = useSendChatMessage({
		chatId,
		socket,
		sender: user ?? null,
		addPendingMessage,
		markPendingFailed,
		removePendingMessage,
		pushMessagesToCache,
		shouldScrollToBottomRef,
		restoreInput: (content) => {
			setMessage((prev) => prev || content);
		},
	});

	useMessagesSocket({ onMessage: (m) => pushMessagesToCache([m]) });
	useChatScrollToBottom({
		messages: displayedMessages,
		chatContainerRef,
		shouldScrollToBottomRef,
	});
	useChatScrollPagination({
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		chatContainerRef,
		sentinel,
		messagesCount: displayedMessages.length,
	});

	const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const success = sendMessage(message);
		if (success) {
			setMessage("");
		}
	};

	return (
		<div className="h-full flex flex-col content-between gap-2">
			<ChatMessagesList
				messages={displayedMessages}
				isInitialLoading={isInitialLoading}
				isFetchingNextPage={isFetchingNextPage}
				chatContainerRef={chatContainerRef}
				setSentinel={setSentinel}
			/>
			<ChatMessageForm
				message={message}
				onMessageChange={setMessage}
				onSubmit={handleSendMessage}
			/>
		</div>
	);
}
