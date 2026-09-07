"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link as LinkIcon } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { buildRoomInviteUrl } from "@/shared/lib/room-invite";
import { writeToClipboard } from "@/shared/lib/clipboard";

const COPIED_FEEDBACK_MS = 2000;

interface CopyInviteLinkButtonProps {
	roomId: string;
}

export function CopyInviteLinkButton({ roomId }: CopyInviteLinkButtonProps) {
	const [isCopied, setIsCopied] = useState(false);
	const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
		};
	}, []);

	const handleCopy = async () => {
		if (!(await writeToClipboard(buildRoomInviteUrl(roomId)))) {
			toast.error("Could not copy to clipboard");
			return;
		}

		setIsCopied(true);

		if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
		resetTimeoutRef.current = setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MS);
	};

	return (
		<Button variant="outline" size="sm" onClick={handleCopy}>
			{/* Both labels share one grid cell, so the button keeps the width of the
			    longer one and the header does not jump when the label swaps. */}
			<span className="grid">
				<span
					className={cn(
						"col-start-1 row-start-1 flex items-center gap-1.5",
						isCopied && "invisible",
					)}
				>
					<LinkIcon className="size-4" />
					Copy invite link
				</span>
				<span
					className={cn(
						"col-start-1 row-start-1 flex items-center gap-1.5",
						!isCopied && "invisible",
					)}
				>
					<Check className="size-4" />
					Copied
				</span>
			</span>
		</Button>
	);
}
