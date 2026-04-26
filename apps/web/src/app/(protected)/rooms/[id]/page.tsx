"use client";
import type { RoomWithParticipantsAndChat } from "@rooms/contracts/room";
import { FullscreenSpinnerLoader } from "@/shared/ui/spinner-loader";
import { RoomHeader } from "@/widgets/room-header";
import { useRoomPresence, useRoomRealtimeChannels } from "@/features/room-presence";
import { RoomSidebar } from "@/widgets/room-sidebar";
import { NotFoundScreen } from "@/shared/ui/not-found-screen";
import { SnakeGame } from "@/features/snake-game";
import { useRoomSnakeSettings } from "@/features/snake-settings";
import { useRoomFromParamsQuery } from "./useRoomFromParamsQuery";

interface RoomRealtimeContentProps {
	room: RoomWithParticipantsAndChat;
	onlineParticipantIds: Set<string>;
}

function RoomRealtimeContent({ room, onlineParticipantIds }: RoomRealtimeContentProps) {
	const { snakeFieldSize, isGameInProgress, changeFieldSize } = useRoomSnakeSettings({
		roomId: room.id,
		initialFieldSize: room.snakeSettings.fieldSize,
	});

	return (
		<div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
			<SnakeGame roomId={room.id} snakeFieldSize={snakeFieldSize} />

			<RoomSidebar
				room={room}
				onlineParticipantIds={onlineParticipantIds}
				snakeFieldSize={snakeFieldSize}
				isSnakeGameInProgress={isGameInProgress}
				onSnakeFieldSizeChange={changeFieldSize}
			/>
		</div>
	);
}

export default function RoomPage() {
	const { roomId, room, isPending } = useRoomFromParamsQuery();

	useRoomRealtimeChannels({ roomId, chatId: room?.chat.id });
	const { onlineParticipantIds } = useRoomPresence({ roomId });

	if (isPending) return <FullscreenSpinnerLoader />;

	if (!room) {
		return <NotFoundScreen description="Room not found" />;
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex w-full max-w-400 flex-col gap-8 px-6 py-12">
				<RoomHeader roomId={roomId} roomName={room.name} />

				<RoomRealtimeContent
					room={room}
					onlineParticipantIds={onlineParticipantIds}
				/>
			</div>
		</div>
	);
}
