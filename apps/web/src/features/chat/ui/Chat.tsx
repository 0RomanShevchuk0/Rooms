import { getMessages, type MessageWithSender, type GetMessagesResponse } from "@/entities/message";

import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SendHorizonal } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useChatSocket } from "@/app/_providers/ws";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CHAT_SOCKET_EVENTS } from "@/entities/chat/model/socket-events";
import { useMeQuery } from "@/entities/user/model/useMeQuery";
import { queryKeys } from "@/shared/react-query";

interface ChatProps {
	chatId: string;
}

export function Chat({ chatId }: ChatProps) {
	const queryClient = useQueryClient();
	const { user } = useMeQuery();

	const chatKey = queryKeys.chats.byId(chatId);
	const { data } = useQuery({
		queryKey: chatKey,
		queryFn: () => getMessages({ chatId }),
	});

	const messages = data?.items;

	const [message, setMessage] = useState("");
	const shouldScrollToBottom = useRef(true);
	const chatContainerRef = useRef<HTMLDivElement>(null);

	const { socket } = useChatSocket();

	const pushMessageToCache = useCallback(
		(newMessage: MessageWithSender) => {
			queryClient.setQueryData<GetMessagesResponse | undefined>(chatKey, (old) => {
				const prev = old?.items ?? [];
				if (prev.some((m) => m.id === newMessage.id)) return old;
				return {
					items: [newMessage, ...prev],
					nextCursor: old?.nextCursor ?? null,
				};
			});
		},
		[chatKey, queryClient],
	);

	useEffect(() => {
		const onMessage = (incoming: MessageWithSender) => {
			pushMessageToCache(incoming);
		};

		socket.on(CHAT_SOCKET_EVENTS.MESSAGE, onMessage);

		return () => {
			socket.off(CHAT_SOCKET_EVENTS.MESSAGE, onMessage);
		};
	}, [socket, pushMessageToCache]);

	const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!user?.id) return;
		const content = message.trim();
		if (!content) return;

		socket.emit(CHAT_SOCKET_EVENTS.MESSAGE, { chatId, senderId: user.id, content }, (response: MessageWithSender) => {
			shouldScrollToBottom.current = true;
			pushMessageToCache(response);
		});

		setMessage("");
	};

	useLayoutEffect(() => {
		if (!chatContainerRef.current) return;

		const SCROLL_THRESHOLD = 100;

		const isAtBottom =
			chatContainerRef.current.scrollHeight -
				chatContainerRef.current.scrollTop -
				chatContainerRef.current.clientHeight <
			SCROLL_THRESHOLD;

		if (messages && (isAtBottom || shouldScrollToBottom.current)) {
			chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight });
			shouldScrollToBottom.current = false;
		}
	}, [messages]);

	const Messages = messages?.map((message) => {
		const messageDate = message.createdAt ? new Date(message.createdAt) : new Date();

		const getFromattedDate = () => {
			if (isToday(messageDate)) {
				return format(messageDate, "HH:mm");
			}
			if (isYesterday(messageDate)) {
				return `Yesterday, at ${format(messageDate, "HH:mm")}`;
			}
			return format(messageDate, "dd.MM.yyyy HH:mm");
		};

		return (
			<div key={message.id} className={cn("mb-2")}>
				<div className="flex items-center gap-2 text-muted-foreground">
					<strong className="text-md">{message.sender.username}</strong>
					<span className="text-xs">{getFromattedDate()}</span>
				</div>

				{message.content}
			</div>
		);
	});

	return (
		<div className="h-full flex flex-col content-between gap-2">
			<div
				ref={chatContainerRef}
				className="min-h-0 flex-1 rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground overflow-auto"
			>
				{messages?.length ? (
					<div className="flex flex-col-reverse gap-2">{Messages}</div>
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
