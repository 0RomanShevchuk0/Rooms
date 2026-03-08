import type { RoomWithParticipants } from "@/entities/room";
import { api } from "@/shared/api";

export function getRoom(id: string) {
	return api.get<RoomWithParticipants>(`/rooms/${id}`);
}
