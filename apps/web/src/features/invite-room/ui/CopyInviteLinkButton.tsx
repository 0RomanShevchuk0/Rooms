"use client";

import { Link as LinkIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { buildRoomInviteUrl } from "@/shared/lib/room-invite";
import { copyToClipboard } from "@/shared/lib/clipboard";

interface CopyInviteLinkButtonProps {
	roomId: string;
}

export function CopyInviteLinkButton({ roomId }: CopyInviteLinkButtonProps) {
	return (
		<Button
			variant="outline"
			size="sm"
			onClick={() =>
				copyToClipboard(buildRoomInviteUrl(roomId), "Invite link copied to clipboard")
			}
		>
			<LinkIcon className="size-4" />
			Invite
		</Button>
	);
}
