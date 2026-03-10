import type { Chat } from "@/entities/chat/model/types";
import { api } from "@/shared/api";

export function getChat(chatId: string) {
	return api.get<Chat>(`/chats/${chatId}`);
}
