import { Prisma } from 'generated/prisma/client';
import { publicUserSelect } from '../../users/users.select';

export const roomPartisipantWithUserSelect = {
	id: true,
	isReady: true,
	userId: true,
	user: { select: publicUserSelect },
} satisfies Prisma.RoomParticipantSelect;

export type RoomPartisipantWithUser = Prisma.RoomParticipantGetPayload<{
	select: typeof roomPartisipantWithUserSelect;
}>;
