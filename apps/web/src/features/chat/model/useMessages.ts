import { getMessages, GetMessagesResponse, MessageWithSender } from "@/entities/message";
import { queryKeys } from "@/shared/react-query";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

interface UseMessagesQueryProps {
	chatId: string;
}

const MESSAGES_LIMIT = 20;

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
			queryClient.setQueryData<GetMessagesResponse | undefined>(chatKey, (old) => {
				const prev = old?.items ?? [];
				const existingIds = new Set(prev.map((m) => m.id));

				const newUnique = newMessages.filter((m) => !existingIds.has(m.id));
				if (newUnique.length === 0) return old;

				return {
					items: [...newUnique, ...prev],
					nextCursor: old?.nextCursor ?? null,
				};
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
