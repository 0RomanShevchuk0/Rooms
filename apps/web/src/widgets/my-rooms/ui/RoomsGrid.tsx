import type { RoomWithParticipants } from "@rooms/contracts/room";
import Link from "next/link";
import { Plus } from "lucide-react";
import { RoomCard } from "@/features/room-card";
import { CreateRoomDialog } from "@/features/create-room";
import { ROUTES } from "@/shared/routes";

interface RoomsGridProps {
	rooms: RoomWithParticipants[];
}

export function RoomsGrid({ rooms }: RoomsGridProps) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{rooms.map((room) => (
				<Link
					key={room.id}
					href={ROUTES.rooms.room(room.id)}
					className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
				>
					<RoomCard room={room} />
				</Link>
			))}

			<CreateRoomDialog>
				<button className="flex min-h-45 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
					<Plus className="size-5" />
					New room
				</button>
			</CreateRoomDialog>
		</div>
	);
}
