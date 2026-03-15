import { useEffect, useLayoutEffect, useRef } from "react";

interface UseChatScrollPaginationProps {
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => void;
	chatContainerRef: React.RefObject<HTMLDivElement | null>;
	sentinel: HTMLDivElement | null;
	messagesCount: number;
}

const PAGINATION_TOP_THRESHOLD = 200;

export function useChatScrollPagination({
	hasNextPage,
	isFetchingNextPage,
	fetchNextPage,
	chatContainerRef,
	sentinel,
	messagesCount,
}: UseChatScrollPaginationProps) {
	const prevScrollHeightRef = useRef<number | null>(null);

	useEffect(() => {
		if (isFetchingNextPage) {
			const container = chatContainerRef.current;
			if (container) {
				prevScrollHeightRef.current = container.scrollHeight;
			}
		}
	}, [isFetchingNextPage, chatContainerRef]);

	useLayoutEffect(() => {
		const container = chatContainerRef.current;
		if (!container || prevScrollHeightRef.current === null) return;

		const diff = container.scrollHeight - prevScrollHeightRef.current;
		if (diff > 0) {
			container.scrollTop += diff;
		}
		prevScrollHeightRef.current = null;
	}, [messagesCount, chatContainerRef]);

	useEffect(() => {
		if (!sentinel || isFetchingNextPage || !hasNextPage) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					fetchNextPage();
				}
			},
			{
				root: chatContainerRef.current,
				rootMargin: `${PAGINATION_TOP_THRESHOLD}px 0px 0px 0px`,
			},
		);

		observer.observe(sentinel);

		return () => {
			observer.disconnect();
		};
	}, [sentinel, chatContainerRef, isFetchingNextPage, hasNextPage, fetchNextPage]);
}
