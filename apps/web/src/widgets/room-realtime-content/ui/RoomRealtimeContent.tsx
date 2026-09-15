import type { RoomWithParticipantsAndChat } from "@rooms/contracts/room";
import { Chat } from "@/features/chat";
import { SnakeGame, SnakePlayersBoard, useSnakePlayerStats } from "@/features/snake-game";
import { SnakeSettingsDialog, useRoomSnakeSettings } from "@/features/snake-settings";
import type { RoomLobbyModel } from "@/features/room-lobby";
import { Card, CardContent } from "@/shared/ui/card";

interface RoomRealtimeContentProps {
	room: RoomWithParticipantsAndChat;
	onlineParticipantIds: Set<string>;
	ownParticipantId: string | null;
	lobby: RoomLobbyModel;
}

export function RoomRealtimeContent({
	room,
	onlineParticipantIds,
	ownParticipantId,
	lobby,
}: RoomRealtimeContentProps) {
	const snakeSettingsModel = useRoomSnakeSettings({
		roomId: room.id,
		initialSettings: room.snakeSettings,
		isGameRunning: lobby.isGameRunning,
	});
	const playerStats = useSnakePlayerStats({ roomId: room.id });

	return (
		<div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
			<SnakeGame
				roomId={room.id}
				snakeFieldSize={snakeSettingsModel.snakeSettings.fieldSize}
				ownParticipantId={ownParticipantId}
				lobby={lobby}
				onlineParticipantIds={onlineParticipantIds}
				action={<SnakeSettingsDialog model={snakeSettingsModel} />}
			/>

			<aside className="flex min-h-0 flex-col gap-4">
				<SnakePlayersBoard
					participants={room.participants}
					onlineParticipantIds={onlineParticipantIds}
					readyParticipantIds={lobby.readyParticipantIds}
					playerStats={playerStats}
					ownParticipantId={ownParticipantId}
					isGameRunning={lobby.isGameRunning}
				/>

				<Card className="flex h-[60vh] flex-col border-border/60 lg:h-auto lg:min-h-0 lg:flex-1">
					<CardContent className="flex min-h-0 flex-1 flex-col gap-3">
						<Chat chatId={room.chat.id} />
					</CardContent>
				</Card>
			</aside>
		</div>
	);
}
