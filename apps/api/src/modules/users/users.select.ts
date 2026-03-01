import { Prisma } from 'generated/prisma/client';

export const publicUserSelect = {
	id: true,
	name: true,
	email: true,
	username: true,
	deletedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
	select: typeof publicUserSelect;
}>;
