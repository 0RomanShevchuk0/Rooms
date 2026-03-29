import { getMessages } from "@/entities/message";
import { queryKeys } from "@/shared/react-query";
import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { GetChatMessagesResponse } from "@rooms/contracts/chat";
import type { MessageWithSender } from "@rooms/contracts/message";

interface UseMessagesQueryProps {
	chatId: string;
}

type InfiniteMessagesData = InfiniteData<
	GetChatMessagesResponse,
	string | undefined
>;

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
				const pages = old?.pages;
				if (!pages) return old;

				const existingIds = new Set<string>();

				for (const page of pages) {
					for (const msg of page.items) {
						existingIds.add(msg.id);
					}
				}

				const newUnique = newMessages.filter((m) => !existingIds.has(m.id));
				if (newUnique.length === 0) return old;

				const firstPage = pages[0];

				const newPages = [
					{
						...firstPage,
						items: [...newUnique, ...firstPage.items],
					},
					...pages.slice(1),
				];

				return {
					...old,
					pages: newPages,
				} satisfies InfiniteMessagesData;
			});
		},
		[chatKey, queryClient],
	);

	const messages = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

	return {
		messages,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		pushMessagesToCache,
	};
}
