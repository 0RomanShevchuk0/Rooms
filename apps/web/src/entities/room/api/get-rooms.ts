import type { RoomWithPlayers } from "@/entities/room";
import { api } from "@/shared/api";

export function getRooms() {
	return api.get<RoomWithPlayers[]>("/rooms");
}
