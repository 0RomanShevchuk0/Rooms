import type { RoomWithParticipants } from "@rooms/contracts/room";
import { Plus } from "lucide-react";
import { RoomCard } from "@/features/room-card";
import { CreateRoomDialog } from "@/features/create-room";
import { RoomCardMenu } from "./RoomCardMenu";

interface RoomsGridProps {
	rooms: RoomWithParticipants[];
}

export function RoomsGrid({ rooms }: RoomsGridProps) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{rooms.map((room) => (
				<RoomCard key={room.id} room={room} action={<RoomCardMenu roomId={room.id} />} />
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
