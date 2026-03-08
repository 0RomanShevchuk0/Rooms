import {
	RoomPartisipantWithUser,
	roomPartisipantWithUserSelect,
} from './partisipants/room-partisipants.select';
import { Prisma } from 'generated/prisma/client';

export type RoomWithPartisipants = Prisma.RoomGetPayload<{
	include: { participants: { select: typeof roomPartisipantWithUserSelect } };
}>;

export type RoomJoinLeaveResult = {
	room: RoomWithPartisipants;
	participant: RoomPartisipantWithUser;
};
