import {
	RoomParticipantWithUser,
	roomParticipantWithUserSelect,
} from './participants/room-participants.select';
import { Prisma } from 'generated/prisma/client';

export type RoomWithParticipants = Prisma.RoomGetPayload<{
	include: { participants: { select: typeof roomParticipantWithUserSelect } };
}>;

export type RoomJoinLeaveResult = {
	room: RoomWithParticipants;
	participant: RoomParticipantWithUser;
};
