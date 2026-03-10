import type { CreateMessagePayload, MessageWithSender } from "@/entities/message/model/types";
import { api } from "@/shared/api";

export function createMessage(payload: CreateMessagePayload) {
	return api.post<MessageWithSender, CreateMessagePayload>("/messages", payload);
}
