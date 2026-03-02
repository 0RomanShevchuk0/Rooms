import type { RoomWithPlayers } from "@/entities/room";
import { api } from "@/shared/api";

export function getRoom(id: string) {
	return api.get<RoomWithPlayers>(`/rooms/${id}`);
}
