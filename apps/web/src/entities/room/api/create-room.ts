import type { RoomWithParticipants } from "@/entities/room";
import { api } from "@/shared/api";

export interface CreateRoomPayload {
	name: string;
	description?: string;
	userIds: string[];
}

export function createRoom(payload: CreateRoomPayload) {
	return api.post<RoomWithParticipants>("/rooms", payload);
}
