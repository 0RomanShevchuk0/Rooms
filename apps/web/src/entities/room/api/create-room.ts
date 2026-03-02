import type { RoomWithPlayers } from "@/entities/room";
import { api } from "@/shared/api";

export interface CreateRoomPayload {
	name: string;
	description?: string;
	participantIds: string[];
}

export function createRoom(payload: CreateRoomPayload) {
	return api.post<RoomWithPlayers>("/rooms", payload);
}
