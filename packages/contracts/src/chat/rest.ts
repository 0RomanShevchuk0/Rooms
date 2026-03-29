import { z } from "zod";
import { ChatIdSchema, ChatSchema } from "./base.js";
import { PaginatedMessagesResponseSchema } from "../message/rest.js";

export const GetChatMessagesQuerySchema = z.object({
	cursor: z.string().uuid().optional(),
	limit: z.coerce.number().int().positive().max(100).optional(),
});

export const GetChatByIdParamsSchema = z.object({
	id: ChatIdSchema,
});

export const GetChatByIdResponseSchema = ChatSchema;
export const GetChatMessagesResponseSchema = PaginatedMessagesResponseSchema;

export type GetChatMessagesQuery = z.infer<typeof GetChatMessagesQuerySchema>;
export type GetChatByIdParams = z.infer<typeof GetChatByIdParamsSchema>;
export type GetChatByIdResponse = z.infer<typeof GetChatByIdResponseSchema>;
export type GetChatMessagesResponse = z.infer<
	typeof GetChatMessagesResponseSchema
>;
