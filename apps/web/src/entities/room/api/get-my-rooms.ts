import type { RoomWithParticipants } from "@rooms/contracts/room";
import { api } from "@/shared/api";

export function getMyRooms() {
	return api.get<RoomWithParticipants[]>("/rooms/my");
}
