import type { RoomWithParticipantsAndChat } from "@rooms/contracts/room";
import { Chat } from "@/features/chat";
import { SnakeSettingsCards, type RoomSnakeSettingsModel } from "@/features/snake-settings";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { RoomParticipantsList } from "@/widgets/room-participants-list";
import { useState } from "react";

type RightPanelView = "info" | "chat";

interface RoomSidebarProps {
	room: RoomWithParticipantsAndChat;
	onlineParticipantIds: Set<string>;
	readyParticipantIds: Set<string>;
	snakeSettingsModel: RoomSnakeSettingsModel;
}

export function RoomSidebar({
	room,
	onlineParticipantIds,
	readyParticipantIds,
	snakeSettingsModel,
}: RoomSidebarProps) {
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
					<RoomParticipantsList
						participants={room.participants}
						onlineParticipantIds={onlineParticipantIds}
						readyParticipantIds={readyParticipantIds}
					/>

					<SnakeSettingsCards model={snakeSettingsModel} />
				</>
			) : (
				<Card className="flex h-[min(72vh,780px)] flex-col border-border/60">
					<CardContent className="flex min-h-0 flex-1 flex-col gap-3">
						<Chat chatId={room.chat.id} />
					</CardContent>
				</Card>
			)}
		</aside>
	);
}
