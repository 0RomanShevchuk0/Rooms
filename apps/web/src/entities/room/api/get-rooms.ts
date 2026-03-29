import type { RoomWithParticipants } from "@rooms/contracts/room";
import { api } from "@/shared/api";

export function getRooms() {
	return api.get<RoomWithParticipants[]>("/rooms");
}
