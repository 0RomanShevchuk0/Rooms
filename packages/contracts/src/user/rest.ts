import { z } from "zod";

export const UserSchema = z.object({
	id: z.string().uuid(),
	username: z.string(),
	email: z.string().email().nullable(),
	name: z.string().nullable(),
	deletedAt: z.string().datetime().nullable(),
});

export type User = z.infer<typeof UserSchema>;
