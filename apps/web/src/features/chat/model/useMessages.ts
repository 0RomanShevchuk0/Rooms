import { getMessages } from "@/entities/message";
import type { ClientMessage } from "@/entities/message";
import { queryKeys } from "@/shared/react-query";
import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import type { GetChatMessagesResponse } from "@rooms/contracts/chat";

interface UseMessagesQueryProps {
	chatId: string;
}

type MessagesPage = Omit<GetChatMessagesResponse, "items"> & {
	items: ClientMessage[];
};

type InfiniteMessagesData = InfiniteData<MessagesPage, string | undefined>;

const MESSAGES_LIMIT = 30;

export function useMessages({ chatId }: UseMessagesQueryProps) {
	const queryClient = useQueryClient();

	const chatKey = queryKeys.chats.byId(chatId);
	const { data, isPending, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
		queryKey: chatKey,
		queryFn: ({ pageParam }): Promise<MessagesPage> =>
			getMessages({ chatId, limit: MESSAGES_LIMIT, cursor: pageParam }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => {
			if (!lastPage.nextCursor) return undefined;
			return lastPage.nextCursor;
		},
	});

	const pushMessagesToCache = (newMessages: ClientMessage[]) => {
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
	};

	const messages = useMemo<ClientMessage[]>(
		() => data?.pages.flatMap((p) => p.items) ?? [],
		[data],
	);

	return {
		messages,
		isPending,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		pushMessagesToCache,
	};
}
