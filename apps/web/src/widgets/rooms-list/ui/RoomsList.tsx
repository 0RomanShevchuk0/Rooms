import { roomApi } from "@/entities/room/api";
import { RoomCard } from "@/features/room-card";
import { useQuery } from "@tanstack/react-query";

export function RoomsList() {
	const roomsQuery = useQuery({
		queryKey: ["rooms"],
		queryFn: roomApi.getRooms,
	});

	const roomCards = roomsQuery.data?.map((room) => <RoomCard key={room.id} room={room} />);

	return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{roomCards}</div>;
}
