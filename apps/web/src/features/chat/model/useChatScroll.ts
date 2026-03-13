import { MessageWithSender } from "@/entities/message";
import { useLayoutEffect } from "react";

interface UseChatScrollProps {
	messages: MessageWithSender[];
	chatContainerRef: React.RefObject<HTMLDivElement | null>;
	shouldScrollToBottomRef: React.RefObject<boolean>;
}

const SCROLL_THRESHOLD = 100;

export function useChatScroll({ messages, chatContainerRef, shouldScrollToBottomRef }: UseChatScrollProps) {
	useLayoutEffect(() => {
		if (!chatContainerRef?.current) return;

		const isAtBottom =
			chatContainerRef.current.scrollHeight -
				chatContainerRef.current.scrollTop -
				chatContainerRef.current.clientHeight <
			SCROLL_THRESHOLD;

		if (messages && (isAtBottom || shouldScrollToBottomRef.current)) {
			chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight });
			shouldScrollToBottomRef.current = false;
		}
	}, [messages, chatContainerRef, shouldScrollToBottomRef]);
}
