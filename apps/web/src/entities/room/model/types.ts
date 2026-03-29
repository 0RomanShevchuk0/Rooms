import type { User } from "@/entities/user";
import type { Chat } from "@rooms/contracts/chat";

export interface Room {
	id: string;
	name: string;
	description?: string;
}

export interface Participant {
	id: string;
}

export interface ParticipantWithUser extends Participant {
	userId: string;
	user: User;
}

export interface ParticipantWithRoomAndUser extends ParticipantWithUser {
	roomId: string;
	room: Room;
}

export interface RoomWithParticipants extends Room {
	participants: ParticipantWithUser[];
}
export interface RoomWithParticipantsAndChat extends RoomWithParticipants {
	chat: Chat;
}
