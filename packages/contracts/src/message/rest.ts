import { z } from "zod";
import { ChatIdSchema } from "../chat/base.js";
import { UserSchema } from "../user/rest.js";

export const MessageIdSchema = z.string().uuid();

export const MessageSchema = z.object({
	id: MessageIdSchema,
	content: z.string(),
	chatId: ChatIdSchema,
	senderId: z.string().uuid(),
	createdAt: z.string().datetime(),
});

export const MessageWithSenderSchema = MessageSchema.extend({
	sender: UserSchema,
});

export const GetMessageByIdParamsSchema = z.object({
	id: MessageIdSchema,
});

export const PaginatedMessagesResponseSchema = z.object({
	items: z.array(MessageWithSenderSchema),
	nextCursor: MessageIdSchema.nullable(),
});

export type Message = z.infer<typeof MessageSchema>;
export type MessageWithSender = z.infer<typeof MessageWithSenderSchema>;
export type GetMessageByIdParams = z.infer<typeof GetMessageByIdParamsSchema>;
export type PaginatedMessagesResponse = z.infer<
	typeof PaginatedMessagesResponseSchema
>;
