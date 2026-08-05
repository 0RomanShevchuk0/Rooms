import { z } from "zod";

export const UsernameSchema = z
	.string()
	.min(3)
	.max(32)
	.regex(
		/^[a-zA-Z0-9._-]+$/,
		"Username may only contain letters, digits, dots, underscores and hyphens",
	);

/** What other users are allowed to see. Never carries contact details. */
export const PublicUserSchema = z.object({
	id: z.uuid(),
	username: z.string(),
	name: z.string().nullable(),
});

/** The full profile, only ever returned to the owner of the account. */
export const UserSchema = PublicUserSchema.extend({
	email: z.email().nullable(),
	deletedAt: z.iso.datetime().nullable(),
});

export const UserIdParamsSchema = z.object({
	id: z.uuid(),
});

export const UpdateUserPayloadSchema = z.object({
	email: z.email().optional(),
	name: z.string().min(4).optional(),
	username: UsernameSchema.optional(),
});

export type PublicUser = z.infer<typeof PublicUserSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserIdParams = z.infer<typeof UserIdParamsSchema>;
export type UpdateUserPayload = z.infer<typeof UpdateUserPayloadSchema>;
