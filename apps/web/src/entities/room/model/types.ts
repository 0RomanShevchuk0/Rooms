import type { User } from "@/entities/user";

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
