"use client";
import { useRoomByIdQuery } from "@/entities/room";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { FullscreenSpinnerLoader } from "@/shared/ui/spinner-loader";
import { useParams } from "next/navigation";
import { RoomHeader } from "@/widgets/room-header";
import { useMeQuery } from "@/entities/user/model/useMeQuery";
import { useRoomPresence, useRoomRealtimeChannels } from "@/features/room-presence";
import { RoomSidebar } from "@/widgets/room-sidebar";

export default function RoomPage() {
	const roomId = useParams().id as string;
	const { user } = useMeQuery();

	const { room, isPending } = useRoomByIdQuery({ roomId });
	useRoomRealtimeChannels({ roomId, chatId: room?.chat.id, userId: user?.id });
	const { onlineParticipantIds } = useRoomPresence({ roomId, userId: user?.id });

	if (isPending) return <FullscreenSpinnerLoader />;

	if (!room) {
		return <div className="w-full h-screen flex items-center justify-center">Room not found</div>;
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex w-full max-w-400 flex-col gap-8 px-6 py-12">
				<RoomHeader roomId={roomId} roomName={room.name} />

				<div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
					<Card className="border-border/60">
						<CardHeader className="space-y-2">
							<div className="flex items-center justify-between">
								<CardTitle>Match starts in 00:10</CardTitle>
							</div>
							<p className="text-sm text-muted-foreground">Controls: WASD / arrows.</p>
						</CardHeader>
						<CardContent className="space-y-4"></CardContent>
					</Card>

					<RoomSidebar room={room} onlineParticipantIds={onlineParticipantIds} />
				</div>
			</div>
		</div>
	);
}
