import type { User } from "@/entities/user";

export interface Message {
	id: string;
	content: string;
	chatId: string;
	senderId: string;
	createdAt?: string;
}

export interface MessageWithSender extends Message {
	sender: User;
}

export interface CreateMessagePayload {
	chatId: string;
	content: string;
	senderId: string;
}

export interface GetMessagesParams {
	chatId: string;
	cursor?: string;
	limit?: number;
}

export interface GetMessagesResponse {
	items: MessageWithSender[];
	nextCursor: string | null;
}
