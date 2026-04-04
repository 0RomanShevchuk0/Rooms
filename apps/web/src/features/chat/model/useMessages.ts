import { getMessages } from "@/entities/message";
import type { ClientMessage, ClientMessageStatus } from "@/entities/message";
import { queryKeys } from "@/shared/react-query";
import { InfiniteData, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { GetChatMessagesResponse } from "@rooms/contracts/chat";

interface UseMessagesQueryProps {
	chatId: string;
}

type MessagesPage = Omit<GetChatMessagesResponse, "items"> & {
	items: ClientMessage[];
};

type InfiniteMessagesData = InfiniteData<MessagesPage, string | undefined>;

const MESSAGES_LIMIT = 30;

function updateMessageInPages(
	pages: MessagesPage[],
	messageId: string,
	updater: (message: ClientMessage) => ClientMessage,
) {
	let hasChanges = false;

	const nextPages = pages.map((page) => {
		let pageHasChanges = false;
		const nextItems = page.items.map((message) => {
			if (message.id !== messageId) return message;

			const updatedMessage = updater(message);
			if (updatedMessage === message) {
				return message;
			}

			pageHasChanges = true;
			hasChanges = true;
			return updatedMessage;
		});

		if (!pageHasChanges) return page;
		return { ...page, items: nextItems };
	});

	return { nextPages, hasChanges };
}

export function useMessages({ chatId }: UseMessagesQueryProps) {
	const queryClient = useQueryClient();

	const chatKey = queryKeys.chats.byId(chatId);
	const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
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

	const setMessageClientStatus = (messageId: string, status?: ClientMessageStatus) => {
		queryClient.setQueryData<InfiniteMessagesData>(chatKey, (old) => {
			const pages = old?.pages;
			if (!pages) return old;

			const { nextPages, hasChanges } = updateMessageInPages(pages, messageId, (message) => {
				if (message.clientStatus === status) {
					return message;
				}

				return { ...message, clientStatus: status };
			});

			if (!hasChanges) return old;
			return { ...old, pages: nextPages } satisfies InfiniteMessagesData;
		});
	};

	const replaceMessageInCache = (messageId: string, nextMessage: ClientMessage) => {
		queryClient.setQueryData<InfiniteMessagesData>(chatKey, (old) => {
			const pages = old?.pages;
			if (!pages) return old;

			const { nextPages, hasChanges } = updateMessageInPages(
				pages,
				messageId,
				() => nextMessage,
			);

			if (!hasChanges) return old;
			return { ...old, pages: nextPages } satisfies InfiniteMessagesData;
		});
	};

	const messages = useMemo<ClientMessage[]>(
		() => data?.pages.flatMap((p) => p.items) ?? [],
		[data],
	);

	return {
		messages,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
		pushMessagesToCache,
		setMessageClientStatus,
		replaceMessageInCache,
	};
}
