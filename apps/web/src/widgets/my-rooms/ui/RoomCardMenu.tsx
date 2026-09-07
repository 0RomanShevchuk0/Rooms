"use client";

import { useState } from "react";
import { Copy, Link as LinkIcon, LogOut, MoreVertical } from "lucide-react";
import { LeaveRoomDialog } from "@/features/leave-room";
import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { buildRoomInviteUrl } from "@/shared/lib/room-invite";
import { copyToClipboard } from "@/shared/lib/clipboard";

interface RoomCardMenuProps {
	roomId: string;
}

export function RoomCardMenu({ roomId }: RoomCardMenuProps) {
	const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label="Room actions"
						className="text-muted-foreground"
					>
						<MoreVertical />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="min-w-48">
					<DropdownMenuItem
						className="cursor-pointer"
						onSelect={() =>
							copyToClipboard(buildRoomInviteUrl(roomId), "Invite link copied to clipboard")
						}
					>
						<LinkIcon className="size-4" />
						Copy invite link
					</DropdownMenuItem>
					<DropdownMenuItem
						className="cursor-pointer"
						onSelect={() => copyToClipboard(roomId, "Room ID copied to clipboard")}
					>
						<Copy className="size-4" />
						Copy room ID
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						variant="destructive"
						className="cursor-pointer"
						onSelect={() => setIsLeaveDialogOpen(true)}
					>
						<LogOut className="size-4" />
						Leave room
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<LeaveRoomDialog
				roomId={roomId}
				open={isLeaveDialogOpen}
				onOpenChange={setIsLeaveDialogOpen}
			/>
		</>
	);
}
