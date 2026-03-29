import type {
	GetChatMessagesQuery,
	GetChatMessagesResponse,
} from "@rooms/contracts/chat";
import { api } from "@/shared/api";

export type GetMessagesParams = {
	chatId: string;
} & GetChatMessagesQuery;

export async function getMessages({
	chatId,
	cursor,
	limit = 30,
}: GetMessagesParams): Promise<GetChatMessagesResponse> {
	const searchParams = new URLSearchParams();
	searchParams.set("limit", String(limit));
	if (cursor) {
		searchParams.set("cursor", cursor);
	}

	const response = await api.get<GetChatMessagesResponse>(
		`/chats/${chatId}/messages?${searchParams.toString()}`,
	);
	return {
		items: response.items ?? [],
		nextCursor: response.nextCursor ?? null,
	};
}
