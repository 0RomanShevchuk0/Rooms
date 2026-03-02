import type { RoomWithPlayers } from "@/entities/room";
import { api } from "@/shared/api";

export function getMyRooms() {
	return api.get<RoomWithPlayers[]>("/rooms/my");
}
