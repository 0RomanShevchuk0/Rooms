import type { RoomWithParticipantsAndChat } from "@rooms/contracts/room";
import { api } from "@/shared/api";

export function getRoom(id: string) {
	return api.get<RoomWithParticipantsAndChat>(`/rooms/${id}`);
}
