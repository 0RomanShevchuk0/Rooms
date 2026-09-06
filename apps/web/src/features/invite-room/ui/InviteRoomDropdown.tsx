import { ChevronDown, Copy, Link as LinkIcon } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import toast from "react-hot-toast";
import { buildRoomInviteUrl } from "@/shared/lib/room-invite";

interface InviteRoomDropdownProps {
	roomId: string;
}

export function InviteRoomDropdown({ roomId }: InviteRoomDropdownProps) {
	const copyToClipboard = async (value: string, successMessage: string) => {
		try {
			await navigator.clipboard.writeText(value);
			toast.success(successMessage);
		} catch {
			toast.error("Could not copy to clipboard");
		}
	};

	const copyRoomId = () => copyToClipboard(roomId, "Room ID copied to clipboard");

	const copyInviteLink = () =>
		copyToClipboard(buildRoomInviteUrl(roomId), "Invite link copied to clipboard");

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="group flex items-center gap-2 rounded-md border border-border bg-muted/50 px-2.5 py-1.5 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 cursor-pointer">
					Invite
					<ChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-180" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-48">
				<DropdownMenuItem className="cursor-pointer" onClick={copyInviteLink}>
					<LinkIcon className="size-4" />
					Copy invite link
				</DropdownMenuItem>
				<DropdownMenuItem className="cursor-pointer" onClick={copyRoomId}>
					<Copy className="size-4" />
					Copy room ID
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
