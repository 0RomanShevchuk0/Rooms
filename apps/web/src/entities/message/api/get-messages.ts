import type { GetMessagesParams, GetMessagesResponse } from "@/entities/message/model/types";
import { api } from "@/shared/api";

export async function getMessages({ chatId, cursor, limit = 30 }: GetMessagesParams) {
	const searchParams = new URLSearchParams();
	searchParams.set("chatId", chatId);
	searchParams.set("limit", String(limit));
	if (cursor) {
		searchParams.set("cursor", cursor);
	}

	const messages = await api.get<GetMessagesResponse>(`/messages?${searchParams.toString()}`);
	return {
		items: messages.items ?? [],
		nextCursor: messages.nextCursor,
	}
}
