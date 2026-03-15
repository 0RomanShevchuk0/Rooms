import { Prisma } from 'generated/prisma/client';
import { publicUserSelect } from '../../users/users.select';

export const roomParticipantWithUserSelect = {
	id: true,
	isReady: true,
	userId: true,
	user: { select: publicUserSelect },
} satisfies Prisma.RoomParticipantSelect;

export type RoomParticipantWithUser = Prisma.RoomParticipantGetPayload<{
	select: typeof roomParticipantWithUserSelect;
}>;
