import type { RoomWithParticipantsAndChat } from "@rooms/contracts/room";
import { SnakeGame } from "@/features/snake-game";
import { useRoomSnakeSettings } from "@/features/snake-settings";
import { useMeQuery } from "@/entities/user/model/useMeQuery";
import { RoomSidebar } from "@/widgets/room-sidebar";

interface RoomRealtimeContentProps {
	room: RoomWithParticipantsAndChat;
	onlineParticipantIds: Set<string>;
}

export function RoomRealtimeContent({ room, onlineParticipantIds }: RoomRealtimeContentProps) {
	const snakeSettingsModel = useRoomSnakeSettings({
		roomId: room.id,
		initialSettings: room.snakeSettings,
	});
	const { user } = useMeQuery();
	const ownParticipantId =
		room.participants.find((participant) => participant.userId === user?.id)?.id ?? null;

	return (
		<div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
			<SnakeGame
				roomId={room.id}
				snakeFieldSize={snakeSettingsModel.snakeSettings.fieldSize}
				ownParticipantId={ownParticipantId}
			/>

			<RoomSidebar
				room={room}
				onlineParticipantIds={onlineParticipantIds}
				snakeSettingsModel={snakeSettingsModel}
			/>
		</div>
	);
}
