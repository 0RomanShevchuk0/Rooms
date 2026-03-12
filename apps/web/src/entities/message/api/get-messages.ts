import type { GetMessagesParams, GetMessagesResponse } from "@/entities/message/model/types";
import { api } from "@/shared/api";

export async function getMessages({
	chatId,
	cursor,
	limit = 30,
}: GetMessagesParams): Promise<GetMessagesResponse> {
	const searchParams = new URLSearchParams();
	searchParams.set("limit", String(limit));
	if (cursor) {
		searchParams.set("cursor", cursor);
	}

	return api.get<GetMessagesResponse>(`/chats/${chatId}/messages?${searchParams.toString()}`);
}
