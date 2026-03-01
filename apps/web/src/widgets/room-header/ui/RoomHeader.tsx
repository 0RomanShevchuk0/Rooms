"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/shared/routes";
import { LeaveRoomDialog } from "@/features/leave-room";
import { InviteRoomDropdown } from "@/features/invite-room";

interface RoomHeaderProps {
	roomId: string;
	roomName: string;
}

export function RoomHeader({ roomId, roomName }: RoomHeaderProps) {
	const router = useRouter();

	return (
		<header className="flex flex-wrap items-center justify-between gap-4">
			<div>
				<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Room</p>
				<h1 className="text-2xl font-semibold">{roomName}</h1>
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					className="text-muted-foreground"
					onClick={() => router.push(ROUTES.home)}
				>
					<ArrowLeft className="size-4" />
					Back
				</Button>
				<InviteRoomDropdown roomId={roomId} />
				<Button size="sm">Ready</Button>
				<LeaveRoomDialog roomId={roomId}>
					<Button variant="destructive" size="sm">
						<LogOut className="size-4" />
						Leave room
					</Button>
				</LeaveRoomDialog>
			</div>
		</header>
	);
}
