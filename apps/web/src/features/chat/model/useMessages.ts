import { getMessages, GetMessagesResponse, MessageWithSender } from "@/entities/message";
import { queryKeys } from "@/shared/react-query";
import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

interface UseMessagesQueryProps {
	chatId: string;
}

type InfiniteMessagesData = InfiniteData<GetMessagesResponse, string | undefined>;

const MESSAGES_LIMIT = 30;

export function useMessagesQuery({ chatId }: UseMessagesQueryProps) {
	const queryClient = useQueryClient();

	const chatKey = queryKeys.chats.byId(chatId);
	const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
		queryKey: chatKey,
		queryFn: ({ pageParam }) => getMessages({ chatId, limit: MESSAGES_LIMIT, cursor: pageParam }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => {
			if (!lastPage.nextCursor) return undefined;
			return lastPage.nextCursor;
		},
	});

	const pushMessagesToCache = useCallback(
		(newMessages: MessageWithSender[]) => {
			queryClient.setQueryData<InfiniteMessagesData>(chatKey, (old) => {
				const oldPages = old?.pages ?? [];
				const existingIds = new Set(oldPages.flatMap((m) => m.items.map((msg) => msg.id)));

				const newUnique = newMessages.filter((m) => !existingIds.has(m.id));
				if (newUnique.length === 0) return old;

				const newPages = oldPages.map((page, index) => {
					if (index !== 0) return page;
					return {
						...page,
						items: [...newUnique, ...page.items],
					};
				});

				return {
					pages: newPages,
					pageParams: old?.pageParams ?? [],
				} satisfies InfiniteMessagesData;
			});
		},
		[chatKey, queryClient],
	);

	const messages = data?.pages.flatMap((page) => page.items) ?? [];

	return {
		messages,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		pushMessagesToCache,
	};
}
