import type { RoomParticipant } from "@rooms/contracts/room";
import { api } from "@/shared/api";

export function getMeRoomParticipant(roomId: string) {
	return api.get<RoomParticipant | null>(`/rooms/${roomId}/participants/me`);
}
