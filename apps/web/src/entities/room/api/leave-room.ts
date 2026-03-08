import type { RoomWithParticipants } from "@/entities/room";
import { api } from "@/shared/api";

export function leaveRoom(id: string) {
	return api.delete<RoomWithParticipants>(`/rooms/${id}/participants`);
}
