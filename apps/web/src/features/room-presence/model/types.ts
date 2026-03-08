import { ParticipantWithUser } from "@/entities/room/model/types";

export interface RoomPresenceData {
	participantId: string;
	onlineParticipantIds: string[];
}

export interface RoomParticipantJoinedData extends RoomPresenceData {
	participant: ParticipantWithUser;
}
