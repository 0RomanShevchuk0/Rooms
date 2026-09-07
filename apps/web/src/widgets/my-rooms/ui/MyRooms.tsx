"use client";

import { useMyRoomsQuery } from "@/entities/room";
import { CreateRoomDialog } from "@/features/create-room";
import { JoinRoomDialog } from "@/features/join-room";
import { Button } from "@/shared/ui/button";
import { FullWidthSpinnerLoader } from "@/shared/ui/spinner-loader";
import { RoomsGrid } from "./RoomsGrid";
import { RoomsWelcome } from "./RoomsWelcome";

export function MyRooms() {
	const { rooms, isPending, isError } = useMyRoomsQuery();

	if (isPending) return <FullWidthSpinnerLoader />;

	if (isError) {
		return (
			<div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center text-sm text-destructive">
				Could not load your rooms. Refresh the page to try again.
			</div>
		);
	}

	// The first-run screen explains the flow; once there are rooms it only
	// takes space away from them.
	if (!rooms?.length) return <RoomsWelcome />;

	return (
		<section className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-2xl font-semibold">Your rooms</h1>
				<div className="flex flex-wrap gap-2">
					<CreateRoomDialog>
						<Button>Create room</Button>
					</CreateRoomDialog>
					<JoinRoomDialog>
						<Button variant="outline">Join with code</Button>
					</JoinRoomDialog>
				</div>
			</div>
			<RoomsGrid rooms={rooms} />
		</section>
	);
}
