import { z } from "zod";
import { ChatIdSchema } from "./model.js";

export const CHAT_SOCKET_EVENTS = {
	CONNECT: "chat:connect",
	DISCONNECT: "chat:disconnect",
	MESSAGE: "chat:message",
} as const;

export const ChatConnectionPayloadSchema = z.object({
	chatId: ChatIdSchema,
});

export const ChatSendMessagePayloadSchema = z.object({
	chatId: ChatIdSchema,
	content: z.string().min(1),
});

export type ChatConnectionPayload = z.infer<typeof ChatConnectionPayloadSchema>;
export type ChatSendMessagePayload = z.infer<typeof ChatSendMessagePayloadSchema>;
