import { useMemo } from "react";
import type { ClientMessage } from "@/entities/message";
import { SpinnerLoader } from "@/shared/ui/spinner-loader";
import { toChatTimeline } from "../model/chatTimeline";
import { ChatDayDivider } from "./ChatDayDivider";
import { Message } from "./Message";

interface ChatMessagesListProps {
	messages: ClientMessage[];
	ownUserId: string | null;
	isInitialLoading: boolean;
	isFetchingNextPage: boolean;
	chatContainerRef: React.RefObject<HTMLDivElement | null>;
	setSentinel: (node: HTMLDivElement | null) => void;
}

export function ChatMessagesList({
	messages,
	ownUserId,
	isInitialLoading,
	isFetchingNextPage,
	chatContainerRef,
	setSentinel,
}: ChatMessagesListProps) {
	const items = useMemo(() => toChatTimeline(messages), [messages]);

	return (
		<div
			ref={chatContainerRef}
			className="min-h-0 flex-1 overflow-auto rounded-lg border border-border/60 bg-muted/20 p-3"
		>
			{isInitialLoading ? (
				<div className="flex h-full w-full items-center justify-center">
					<SpinnerLoader />
				</div>
			) : items.length ? (
				<div className="flex flex-col-reverse gap-0.5">
					{items.map((item) =>
						item.type === "day" ? (
							<ChatDayDivider key={item.key} date={item.date} />
						) : (
							<Message
								key={item.message.id}
								message={item.message}
								isOwn={item.message.senderId === ownUserId}
							/>
						),
					)}
					<div ref={setSentinel} />
					{isFetchingNextPage ? (
						<div className="flex w-full items-center justify-center py-2">
							<SpinnerLoader size={18} />
						</div>
					) : null}
				</div>
			) : (
				<div className="flex h-full w-full items-center justify-center text-center text-sm text-muted-foreground">
					No messages yet
				</div>
			)}
		</div>
	);
}
