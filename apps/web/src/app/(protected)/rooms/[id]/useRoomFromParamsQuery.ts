import { useRoomByIdQuery } from "@/entities/room";
import { useParams } from "next/navigation";

export function useRoomFromParamsQuery() {
	const { id: roomId } = useParams<{ id: string }>();
	const { room, isPending, isFetching, error, refetch } = useRoomByIdQuery({ roomId });

	return { roomId, room, isPending, isFetching, error, refetch };
}
