import { Prisma } from 'generated/prisma/client';

/**
 * Everything the API needs about a user internally, and everything the owner of
 * the account is allowed to see. Must not be handed to anyone else.
 */
export const userRecordSelect = {
	id: true,
	name: true,
	email: true,
	username: true,
	deletedAt: true,
} satisfies Prisma.UserSelect;

/** What other users are allowed to see — no contact details. */
export const publicUserSelect = {
	id: true,
	name: true,
	username: true,
} satisfies Prisma.UserSelect;

export type UserRecord = Prisma.UserGetPayload<{
	select: typeof userRecordSelect;
}>;

export type PublicUser = Prisma.UserGetPayload<{
	select: typeof publicUserSelect;
}>;
