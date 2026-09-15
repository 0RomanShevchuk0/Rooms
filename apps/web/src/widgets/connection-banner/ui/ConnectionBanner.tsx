"use client";

import { RotateCw } from "lucide-react";
import { useChatSocket, useRoomsSocket, useSnakeGameSocket } from "@/shared/lib/realtime";

export function ConnectionBanner() {
	const isRoomsReconnecting = useRoomsSocket((state) => state.isReconnecting);
	const isChatReconnecting = useChatSocket((state) => state.isReconnecting);
	const isSnakeReconnecting = useSnakeGameSocket((state) => state.isReconnecting);

	if (!isRoomsReconnecting && !isChatReconnecting && !isSnakeReconnecting) return null;

	return (
		<div
			role="status"
			className="fixed top-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm shadow-md"
		>
			<RotateCw className="size-4 animate-spin text-muted-foreground" />
			Connection lost — reconnecting…
		</div>
	);
}
