import { z } from "zod";

export const ChatIdSchema = z.string().uuid();

export const ChatSchema = z.object({
	id: ChatIdSchema,
	roomId: z.string().uuid().nullable().optional(),
	createdAt: z.string().datetime(),
});

export type ChatId = z.infer<typeof ChatIdSchema>;
export type Chat = z.infer<typeof ChatSchema>;
