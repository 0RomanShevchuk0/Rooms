import { roomApi } from "@/entities/room/api";
import { RoomCard } from "@/features/room-card";
import { queryKeys } from "@/shared/react-query";
import { FullWidthSpinnerLoader } from "@/shared/ui/spinner-loader";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ROUTES } from "@/shared/routes";

export function RoomsList() {
	const roomsQuery = useQuery({
		queryKey: queryKeys.rooms.my(),
		queryFn: roomApi.getMyRooms,
	});

	const roomCards = roomsQuery.data?.map((room) => (
		<Link key={room.id} href={ROUTES.rooms.room(room.id)}>
			<RoomCard room={room} />
		</Link>
	));
	console.log("🚀 ~ rooms:", roomsQuery.data);

	if (roomsQuery.isPending) return <FullWidthSpinnerLoader />;
	if (roomsQuery.isError) return <div className="w-full text-center text-red-500">Error loading rooms</div>;

	return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{roomCards}</div>;
}
