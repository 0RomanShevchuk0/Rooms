import { getRoom } from "@/entities/room/api";
import { queryKeys } from "@/shared/react-query";
import { useQuery } from "@tanstack/react-query";

interface UseRoomByIdQueryProps {
	roomId: string;
}

export function useRoomByIdQuery({ roomId }: UseRoomByIdQueryProps) {
	const { data: room, isPending } = useQuery({
		queryKey: queryKeys.rooms.byId(roomId),
		queryFn: () => getRoom(roomId),
	});

	return { room, isPending };
}
