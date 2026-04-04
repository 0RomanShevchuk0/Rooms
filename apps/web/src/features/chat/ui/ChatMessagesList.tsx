import type { ClientMessage } from "@/entities/message";
import { SpinnerLoader } from "@/shared/ui/spinner-loader";
import { Message } from "./Message";

interface ChatMessagesListProps {
	messages: ClientMessage[];
	isInitialLoading: boolean;
	isFetchingNextPage: boolean;
	chatContainerRef: React.RefObject<HTMLDivElement | null>;
	setSentinel: (node: HTMLDivElement | null) => void;
}

export function ChatMessagesList({
	messages,
	isInitialLoading,
	isFetchingNextPage,
	chatContainerRef,
	setSentinel,
}: ChatMessagesListProps) {
	return (
		<div
			ref={chatContainerRef}
			className="min-h-0 flex-1 rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground overflow-auto"
		>
			{isInitialLoading ? (
				<div className="w-full h-full flex items-center justify-center">
					<SpinnerLoader />
				</div>
			) : messages.length ? (
				<div className="flex flex-col-reverse gap-2">
					{messages.map((message) => (
						<Message key={message.id} message={message} />
					))}
					<div ref={setSentinel} />
					{isFetchingNextPage ? (
						<div className="w-full py-2 flex items-center justify-center">
							<SpinnerLoader size={18} />
						</div>
					) : null}
				</div>
			) : (
				<div className="w-full h-full flex items-center justify-center text-center text-sm text-muted-foreground">
					No messages yet
				</div>
			)}
		</div>
	);
}
