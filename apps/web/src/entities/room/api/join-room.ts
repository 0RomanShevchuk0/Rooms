import type { RoomWithParticipants } from "@/entities/room";
import { api } from "@/shared/api";

export function joinRoom(id: string) {
	return api.post<RoomWithParticipants>(`/rooms/${id}/participants`);
}
