import type { RoomWithParticipants } from "@rooms/contracts/room";
import { api } from "@/shared/api";

export function leaveRoom(id: string) {
	return api.delete<RoomWithParticipants>(`/rooms/${id}/participants`);
}
