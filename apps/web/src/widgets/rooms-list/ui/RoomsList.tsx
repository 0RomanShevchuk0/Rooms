import { useMyRoomsQuery } from "@/entities/room";
import { RoomCard } from "@/features/room-card";
import { FullWidthSpinnerLoader } from "@/shared/ui/spinner-loader";
import Link from "next/link";
import { ROUTES } from "@/shared/routes";

export function RoomsList() {
	const { rooms, isPending, isError } = useMyRoomsQuery();

	const roomCards = rooms?.map((room) => (
		<Link key={room.id} href={ROUTES.rooms.room(room.id)}>
			<RoomCard room={room} />
		</Link>
	));

	if (isPending) return <FullWidthSpinnerLoader />;
	if (isError) return <div className="w-full text-center text-red-500">Error loading rooms</div>;

	return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{roomCards}</div>;
}
