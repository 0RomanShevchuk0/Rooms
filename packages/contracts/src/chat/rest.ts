import { z } from "zod";
import { ChatIdSchema } from "./model.js";

export const GetChatMessagesQuerySchema = z.object({
	cursor: z.string().uuid().optional(),
	limit: z.number().int().positive().max(100).optional(),
});

export const GetChatByIdParamsSchema = z.object({
	id: ChatIdSchema,
});

export type GetChatMessagesQuery = z.infer<typeof GetChatMessagesQuerySchema>;
export type GetChatByIdParams = z.infer<typeof GetChatByIdParamsSchema>;
