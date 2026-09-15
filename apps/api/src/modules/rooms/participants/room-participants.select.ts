import { Prisma } from 'generated/prisma/client';
import { publicUserSelect } from '../../users/users.select';

export const roomParticipantWithUserSelect = {
	id: true,
	isReady: true,
	userId: true,
	user: { select: publicUserSelect },
} satisfies Prisma.RoomParticipantSelect;

/** Join order is what the client keys snake colours on, so it has to be the same everywhere. */
export const roomParticipantsInclude = {
	select: roomParticipantWithUserSelect,
	orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
} satisfies Prisma.Room$participantsArgs;

export type RoomParticipantWithUser = Prisma.RoomParticipantGetPayload<{
	select: typeof roomParticipantWithUserSelect;
}>;
