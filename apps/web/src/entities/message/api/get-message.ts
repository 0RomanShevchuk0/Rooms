import type { MessageWithSender } from "@rooms/contracts/message";
import { api } from "@/shared/api";

export function getMessage(messageId: string) {
	return api.get<MessageWithSender>(`/messages/${messageId}`);
}
