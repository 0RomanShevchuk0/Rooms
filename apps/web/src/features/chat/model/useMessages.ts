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

	const pushMessageToCache = useCallback(
		(newMessage: MessageWithSender) => {
			queryClient.setQueryData<GetMessagesResponse | undefined>(chatKey, (old) => {
				const prev = old?.items ?? [];
				if (prev.some((m) => m.id === newMessage.id)) return old;
				return {
					items: [newMessage, ...prev],
					nextCursor: old?.nextCursor ?? null,
				};
			});
		},
		[chatKey, queryClient],
	);
	return {
		messages: data?.items ?? [],
		cursor: data?.nextCursor ?? null,
		pushMessageToCache,
	};
}
