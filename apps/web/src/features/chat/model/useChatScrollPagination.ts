import { useEffect, useRef } from "react";

interface UseChatScrollPaginationProps {
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage: () => void;
	chatContainerRef: React.RefObject<HTMLDivElement | null>;
	sentinel: HTMLDivElement | null;
}

const PAGINATION_TOP_THRESHOLD = 200;

export function useChatScrollPagination({
	hasNextPage,
	isFetchingNextPage,
	fetchNextPage,
	chatContainerRef,
	sentinel,
}: UseChatScrollPaginationProps) {
	const paginationRef = useRef({ hasNextPage, isFetchingNextPage, fetchNextPage });

	useEffect(() => {
		paginationRef.current = { hasNextPage, isFetchingNextPage, fetchNextPage };
	});

	useEffect(() => {
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const { hasNextPage, isFetchingNextPage, fetchNextPage } = paginationRef.current;
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
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
	}, [sentinel, chatContainerRef]);
}
