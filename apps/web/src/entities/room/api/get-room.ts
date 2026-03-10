import type { RoomWithParticipantsAndChat } from "@/entities/room";
import { api } from "@/shared/api";

export function getRoom(id: string) {
	return api.get<RoomWithParticipantsAndChat>(`/rooms/${id}`);
}
