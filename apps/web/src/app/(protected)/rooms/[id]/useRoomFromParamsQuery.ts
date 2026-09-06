import { useRoomByIdQuery } from "@/entities/room";
import { useParams } from "next/navigation";

export function useRoomFromParamsQuery() {
	const { id: roomId } = useParams<{ id: string }>();
	const { room, isPending, error } = useRoomByIdQuery({ roomId });

	return { roomId, room, isPending, error };
}
