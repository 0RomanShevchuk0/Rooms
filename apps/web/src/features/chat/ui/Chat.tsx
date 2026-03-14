import { type MessageWithSender } from "@/entities/message";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { SendHorizonal } from "lucide-react";
import { useChatSocket } from "@/app/_providers/ws";
import { useRef, useState } from "react";
import { CHAT_SOCKET_EVENTS } from "@/entities/chat/model/socket-events";
import { useMeQuery } from "@/entities/user/model/useMeQuery";
import { Message } from "./Message";
import { useMessagesSocket } from "../model/useMessagesSocket";
import { useMessagesQuery } from "../model/useMessages";
import { useChatScroll } from "../model/useChatScroll";

interface ChatProps {
	chatId: string;
}

// todo: add infinite scroll for messages

export function Chat({ chatId }: ChatProps) {
	const { user } = useMeQuery();

	const [message, setMessage] = useState("");
	const shouldScrollToBottomRef = useRef(true);
	const chatContainerRef = useRef<HTMLDivElement | null>(null);

	const { socket } = useChatSocket();

	const { messages, pushMessagesToCache } = useMessagesQuery({ chatId });
	useMessagesSocket({ onMessage: (m) => pushMessagesToCache([m]) });
	useChatScroll({ messages, chatContainerRef, shouldScrollToBottomRef });

	const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!user?.id) return;
		const content = message.trim();
		if (!content) return;

		socket.emit(CHAT_SOCKET_EVENTS.MESSAGE, { chatId, senderId: user.id, content }, (response: MessageWithSender) => {
			shouldScrollToBottomRef.current = true;
			pushMessagesToCache([response]);
		});

		setMessage("");
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
