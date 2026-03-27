"use client";
import { FullscreenSpinnerLoader } from "@/shared/ui/spinner-loader";
import { RoomHeader } from "@/widgets/room-header";
import { useRoomPresence, useRoomRealtimeChannels } from "@/features/room-presence";
import { RoomSidebar } from "@/widgets/room-sidebar";
import { NotFoundScreen } from "@/shared/ui/not-found-screen";
import { SnakeGame } from "@/features/snake-game";
import { useRoomFromParamsQuery } from "./useRoomFromParamsQuery";

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

				<div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
					<SnakeGame />

					<RoomSidebar room={room} onlineParticipantIds={onlineParticipantIds} />
				</div>
			</div>
		</div>
	);
}
