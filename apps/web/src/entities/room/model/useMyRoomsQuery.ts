import { getMyRooms } from "@/entities/room/api";
import { queryKeys } from "@/shared/react-query";
import { useQuery } from "@tanstack/react-query";

export function useMyRoomsQuery() {
	const { data: rooms, isPending, isError } = useQuery({
		queryKey: queryKeys.rooms.my(),
		queryFn: getMyRooms,
	});

	return { rooms, isPending, isError };
}
