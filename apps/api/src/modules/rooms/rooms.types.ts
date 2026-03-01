import { publicUserSelect, type PublicUser } from '../users/users.select';
import { Prisma } from 'generated/prisma/browser';

export type RoomWithPlayers = Prisma.RoomGetPayload<{
	include: { players: { select: typeof publicUserSelect } };
}>;

export type RoomJoinLeaveResult = {
	room: RoomWithPlayers;
	player: PublicUser;
};
