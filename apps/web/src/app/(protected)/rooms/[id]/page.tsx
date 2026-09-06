"use client";
import { FullscreenSpinnerLoader } from "@/shared/ui/spinner-loader";
import { RoomHeader } from "@/widgets/room-header";
import { useRoomPresence, useRoomRealtimeChannels } from "@/features/room-presence";
import { useRoomLobby } from "@/features/room-lobby";
import { useMyRoomParticipantQuery } from "@/entities/room";
import { NotFoundScreen } from "@/shared/ui/not-found-screen";
import { ErrorScreen } from "@/shared/ui/error-screen";
import { RoomRealtimeContent } from "@/widgets/room-realtime-content";
import { useRoomInvite } from "@/features/join-room";
import { getHttpStatus } from "@/shared/react-query";
import { useRoomFromParamsQuery } from "./useRoomFromParamsQuery";

// A room the user may not see is reported as missing rather than forbidden, so
// a stranger with a room id learns nothing from the difference.
const HIDDEN_ROOM_STATUSES = [403, 404];

export default function RoomPage() {
	const { roomId, room, isPending, isFetching, error, refetch } = useRoomFromParamsQuery();
	const { isJoining } = useRoomInvite({
		roomId,
		roomError: error,
		hasRoomAccess: Boolean(room),
	});

	useRoomRealtimeChannels({ roomId, chatId: room?.chat.id });
	const { onlineParticipantIds } = useRoomPresence({ roomId });
	// Subscribed above the loading state: the server sends the lobby snapshot
	// right after the socket joins, which can land before the room query does.
	const { participantId: ownParticipantId } = useMyRoomParticipantQuery(roomId);
	const lobby = useRoomLobby({ roomId, ownParticipantId });

	if (isPending || isJoining) return <FullscreenSpinnerLoader />;

	if (!room) {
		const status = getHttpStatus(error);

		if (status !== undefined && HIDDEN_ROOM_STATUSES.includes(status)) {
			return <NotFoundScreen description="Room not found" />;
		}

		return (
			<ErrorScreen
				description="Could not load this room. Check your connection and try again."
				onRetry={() => refetch()}
				isRetrying={isFetching}
			/>
		);
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex w-full max-w-400 flex-col gap-8 px-6 py-12">
				<RoomHeader roomId={roomId} roomName={room.name} />

				<RoomRealtimeContent
					room={room}
					onlineParticipantIds={onlineParticipantIds}
					ownParticipantId={ownParticipantId}
					lobby={lobby}
				/>
			</div>
		</div>
	);
}
