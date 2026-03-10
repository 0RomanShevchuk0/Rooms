import type { MessageWithSender } from "@/entities/message/model/types";
import { api } from "@/shared/api";

export function getMessage(messageId: string) {
	return api.get<MessageWithSender>(`/messages/${messageId}`);
}
