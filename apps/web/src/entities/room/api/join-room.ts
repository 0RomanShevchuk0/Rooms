import type { RoomWithPlayers } from "@/entities/room";
import { api } from "@/shared/api";

export function joinRoom(id: string) {
	return api.post<RoomWithPlayers>(`/rooms/${id}/members`);
}
