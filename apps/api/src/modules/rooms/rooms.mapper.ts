import type {
	RoomParticipant,
	RoomParticipantJoinedPayload,
	RoomPresencePayload,
	RoomWithParticipants,
	RoomWithParticipantsAndChat,
} from '@rooms/contracts/room';
import type { RoomParticipantWithUser } from './participants/room-participants.select';
import type {
	RoomWithParticipants as RoomWithParticipantsEntity,
	RoomWithParticipantsAndChat as RoomWithParticipantsAndChatEntity,
} from './rooms.types';
import { DomainError } from 'src/shared/errors/domain.error';
import { toRestUser } from '../users/users.mapper';

export function toRoomParticipantPayload(
	participant: RoomParticipantWithUser,
): RoomParticipant {
	return {
		id: participant.id,
		isReady: participant.isReady,
		userId: participant.userId,
		user: toRestUser(participant.user),
	};
}

export function toRoomWithParticipants(
	room: RoomWithParticipantsEntity | RoomWithParticipantsAndChatEntity,
): RoomWithParticipants {
	return {
		id: room.id,
		name: room.name,
		description: room.description,
		participants: room.participants.map(toRoomParticipantPayload),
	};
}

export function toRoomWithParticipantsAndChat(
	room: RoomWithParticipantsAndChatEntity,
): RoomWithParticipantsAndChat {
	if (!room.chat) {
		throw DomainError.notFound(`Chat for room "${room.id}" not found`, {
			entity: 'chat',
			roomId: room.id,
		});
	}

	return {
		...toRoomWithParticipants(room),
		chat: {
			id: room.chat.id,
			roomId: room.chat.roomId,
			createdAt: room.chat.createdAt.toISOString(),
		},
	};
}

export function toRoomPresencePayload(
	participantId: string,
	onlineParticipantIds: string[],
): RoomPresencePayload {
	return {
		participantId,
		onlineParticipantIds,
	};
}

export function toRoomParticipantJoinedPayload(
	participant: RoomParticipantWithUser,
	onlineParticipantIds: string[],
): RoomParticipantJoinedPayload {
	return {
		participantId: participant.id,
		onlineParticipantIds,
		participant: toRoomParticipantPayload(participant),
	};
}
