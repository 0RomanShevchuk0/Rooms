import type { ParticipantWithUser } from "@/entities/room/model/types";
import { api } from "@/shared/api";

export function getMeRoomParticipant(roomId: string) {
	return api.get<ParticipantWithUser | null>(`/rooms/${roomId}/participants/me`);
}
