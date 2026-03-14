import { getMessages, GetMessagesResponse, MessageWithSender } from "@/entities/message";
import { queryKeys } from "@/shared/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

interface UseMessagesQueryProps {
	chatId: string;
}

export function useMessagesQuery({ chatId }: UseMessagesQueryProps) {
	const queryClient = useQueryClient();

	const chatKey = queryKeys.chats.byId(chatId);
	const { data } = useQuery({
		queryKey: chatKey,
		queryFn: () => getMessages({ chatId }),
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

	return {
		messages: data?.items ?? [],
		cursor: data?.nextCursor ?? null,
		pushMessagesToCache,
	};
}
