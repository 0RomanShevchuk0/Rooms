import { api } from "@/shared/api";
import type { RoomWithPlayers } from "@/entities/room";

export interface CreateRoomPayload {
	name: string;
	description?: string;
	participantIds: string[];
}

export const roomApi = {
	getRooms: () => api.get<RoomWithPlayers[]>("/rooms"),
	getRoom: (id: string) => api.get<RoomWithPlayers>(`/rooms/${id}`),
	getMyRooms: () => api.get<RoomWithPlayers[]>("/rooms/my"),
	createRoom: (payload: CreateRoomPayload) => api.post<RoomWithPlayers>("/rooms", payload),
	joinRoom: (id: string) => api.post<RoomWithPlayers>(`/rooms/${id}/members`),
};
