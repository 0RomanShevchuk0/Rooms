import { z } from "zod";

export const UserSchema = z.object({
	id: z.string().uuid(),
	username: z.string(),
	email: z.string().email().nullable(),
	name: z.string().nullable(),
	deletedAt: z.string().datetime().nullable(),
});

export const UserIdParamsSchema = z.object({
	id: z.string().uuid(),
});

export const UpdateUserPayloadSchema = z.object({
	email: z.string().email().optional(),
	name: z.string().min(4).optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UserIdParams = z.infer<typeof UserIdParamsSchema>;
export type UpdateUserPayload = z.infer<typeof UpdateUserPayloadSchema>;
