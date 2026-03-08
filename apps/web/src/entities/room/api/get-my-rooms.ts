import type { RoomWithParticipants } from "@/entities/room";
import { api } from "@/shared/api";

export function getMyRooms() {
	return api.get<RoomWithParticipants[]>("/rooms/my");
}
