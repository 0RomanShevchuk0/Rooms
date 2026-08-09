import type { RoomWithParticipantsAndChat } from "@rooms/contracts/room";
import { SnakeGame } from "@/features/snake-game";
import { useRoomSnakeSettings } from "@/features/snake-settings";
import type { RoomLobbyModel } from "@/features/room-lobby";
import { RoomSidebar } from "@/widgets/room-sidebar";

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

	return (
		<div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
			<SnakeGame
				roomId={room.id}
				snakeFieldSize={snakeSettingsModel.snakeSettings.fieldSize}
				ownParticipantId={ownParticipantId}
				lobby={lobby}
			/>

			<RoomSidebar
				room={room}
				onlineParticipantIds={onlineParticipantIds}
				readyParticipantIds={lobby.readyParticipantIds}
				snakeSettingsModel={snakeSettingsModel}
			/>
		</div>
	);
}
