import { z } from "zod";

export const ChatIdSchema = z.uuid();

export const ChatSchema = z.object({
	id: ChatIdSchema,
	roomId: z.uuid().nullable().optional(),
	createdAt: z.iso.datetime(),
});

export type ChatId = z.infer<typeof ChatIdSchema>;
export type Chat = z.infer<typeof ChatSchema>;
