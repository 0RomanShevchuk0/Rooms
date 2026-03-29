import { z } from "zod";
import { ChatIdSchema } from "./base.js";

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

export const ChatMessageSenderSchema = z.object({
	id: z.string().uuid(),
	username: z.string(),
	email: z.string().email().nullable(),
	name: z.string().nullable(),
	deletedAt: z.string().datetime().nullable(),
});

export const ChatMessagePayloadSchema = z.object({
	id: z.string().uuid(),
	content: z.string(),
	chatId: ChatIdSchema,
	senderId: z.string().uuid(),
	createdAt: z.string().datetime(),
	sender: ChatMessageSenderSchema,
});

export type ChatConnectionPayload = z.infer<typeof ChatConnectionPayloadSchema>;
export type ChatSendMessagePayload = z.infer<typeof ChatSendMessagePayloadSchema>;
export type ChatMessageSender = z.infer<typeof ChatMessageSenderSchema>;
export type ChatMessagePayload = z.infer<typeof ChatMessagePayloadSchema>;
