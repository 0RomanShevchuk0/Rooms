import type { RoomWithParticipants } from "@rooms/contracts/room";
import { api } from "@/shared/api";

export function joinRoom(id: string) {
	return api.post<RoomWithParticipants>(`/rooms/${id}/participants`);
}
