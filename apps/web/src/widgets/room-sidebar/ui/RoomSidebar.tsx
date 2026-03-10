import { RoomWithParticipantsAndChat } from "@/entities/room/model/types";
import { Chat } from "@/features/chat";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { RoomParticipantsList } from "@/widgets/room-participants-list";
import { useState } from "react";

type RightPanelView = "info" | "chat";

interface RoomSidebarProps {
	room: RoomWithParticipantsAndChat;
	onlineParticipantIds: Set<string>;
}

export function RoomSidebar({ room, onlineParticipantIds }: RoomSidebarProps) {
	const [rightPanelView, setRightPanelView] = useState<RightPanelView>("info");

	return (
		<aside className="flex flex-col gap-4">
			<div className="grid w-full grid-cols-2 rounded-lg border border-border/60 bg-muted/30 p-1">
				<Button
					size="sm"
					variant={rightPanelView === "info" ? "default" : "ghost"}
					className="w-full"
					onClick={() => setRightPanelView("info")}
				>
					Info
				</Button>
				<Button
					size="sm"
					variant={rightPanelView === "chat" ? "default" : "ghost"}
					className="w-full"
					onClick={() => setRightPanelView("chat")}
				>
					Chat
				</Button>
			</div>

			{rightPanelView === "info" ? (
				<>
					<RoomParticipantsList participants={room.participants} onlineParticipantIds={onlineParticipantIds} />

					<Card className="border-border/60">
						<CardHeader>
							<CardTitle>Room settings</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-2 text-xs text-muted-foreground">
							<div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-2">Speed: medium</div>
							<div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-2">Grid: 12x6</div>
							<div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-2">Play to 3</div>
							<div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-2">Fruits: 1</div>
						</CardContent>
					</Card>
				</>
			) : (
				<Card className="border-border/60 lg:h-[min(72vh,780px)]">
					<CardHeader className="space-y-2">
						<CardTitle>Chat</CardTitle>
						<p className="text-sm text-muted-foreground">Room discussion appears here.</p>
					</CardHeader>
					<CardContent className="flex min-h-0 flex-1 flex-col gap-3">
						<Chat chatId={room.chat.id} />
					</CardContent>
				</Card>
			)}
		</aside>
	);
}
