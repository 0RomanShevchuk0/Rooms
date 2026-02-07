import { api } from "@/shared/api";
import type { RoomWithPlayers } from "@/entities/room";

export const roomApi = {
	getRooms: () => api.get<RoomWithPlayers[]>("/rooms"),
};
