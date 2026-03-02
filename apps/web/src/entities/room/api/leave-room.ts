import type { RoomWithPlayers } from "@/entities/room";
import { api } from "@/shared/api";

export function leaveRoom(id: string) {
	return api.delete<RoomWithPlayers>(`/rooms/${id}/members`);
}
