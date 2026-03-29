import type {
	ChatMessagePayload,
	GetChatByIdResponse,
} from '@rooms/contracts/chat';
import type { MessageWithSender as RestMessageWithSender } from '@rooms/contracts/message';
import type { MessageWithSender } from '../messages/messages.types';
import { toRestUser } from '../users/users.mapper';

type ChatForResponse = {
	id: string;
	roomId: string | null;
	createdAt: Date;
};

export function toGetChatByIdResponse(
	chat: ChatForResponse,
): GetChatByIdResponse {
	return {
		id: chat.id,
		roomId: chat.roomId,
		createdAt: chat.createdAt.toISOString(),
	};
}

export function toMessageWithSenderPayload(
	message: MessageWithSender,
): RestMessageWithSender {
	return {
		id: message.id,
		content: message.content,
		chatId: message.chatId,
		senderId: message.senderId,
		createdAt: message.createdAt.toISOString(),
		sender: toRestUser(message.sender),
	};
}

export function toChatMessagePayload(
	message: MessageWithSender,
): ChatMessagePayload {
	return toMessageWithSenderPayload(message);
}
