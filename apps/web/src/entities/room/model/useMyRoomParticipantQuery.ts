import { queryKeys } from "@/shared/react-query";
import { getMeRoomParticipant } from "../api";
import { useQuery } from "@tanstack/react-query";

export function useMyRoomParticipantQuery(roomId: string) {
	const { data: participant } = useQuery({
		queryKey: queryKeys.rooms.meRoomParticipant(roomId),
		queryFn: () => getMeRoomParticipant(roomId),
		enabled: Boolean(roomId),
	});

	return { participant, participantId: participant?.id ?? null };
}
