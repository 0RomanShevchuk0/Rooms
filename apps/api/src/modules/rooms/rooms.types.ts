import {
	RoomParticipantWithUser,
	roomParticipantWithUserSelect,
} from './participants/room-participants.select';
import { Prisma } from 'generated/prisma/client';

export type RoomWithParticipants = Prisma.RoomGetPayload<{
	include: { participants: { select: typeof roomParticipantWithUserSelect } };
}>;

export type RoomWithParticipantsAndChat = Prisma.RoomGetPayload<{
	include: {
		participants: { select: typeof roomParticipantWithUserSelect };
		chat: true;
	};
}>;

export type RoomJoinLeaveResult = {
	room: RoomWithParticipantsAndChat;
	participant: RoomParticipantWithUser;
};
