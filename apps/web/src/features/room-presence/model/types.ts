import type { RoomPresencePayload } from "@rooms/contracts/room";
import type { ParticipantWithUser } from "@/entities/room/model/types";

export type RoomPresenceData = RoomPresencePayload;

export type RoomParticipantJoinedData = RoomPresenceData & {
	participant: ParticipantWithUser;
};
