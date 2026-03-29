import type {
	CreateRoomPayload,
	RoomWithParticipants,
} from "@rooms/contracts/room";
import { api } from "@/shared/api";

export function createRoom(payload: CreateRoomPayload) {
	return api.post<RoomWithParticipants>("/rooms", payload);
}
