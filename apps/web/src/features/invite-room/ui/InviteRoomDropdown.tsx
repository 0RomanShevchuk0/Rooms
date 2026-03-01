import { ChevronDown, Copy } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";
import toast from "react-hot-toast";

interface InviteRoomDropdownProps {
	roomId: string;
}

export function InviteRoomDropdown({ roomId }: InviteRoomDropdownProps) {
	const copyRoomId = () => {
		navigator.clipboard.writeText(roomId);
		toast.success("Room ID copied to clipboard");
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					className="group flex items-center gap-2 rounded-md border border-border bg-muted/50 px-2.5 py-1.5 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 cursor-pointer"
					aria-label="User menu"
				>
					Invite
					<ChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-180" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-48">
				<DropdownMenuItem className="cursor-pointer" onClick={copyRoomId}>
					<Copy className="size-4" />
					Copy room ID
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
