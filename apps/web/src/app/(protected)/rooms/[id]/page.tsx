"use client";
import { useRoomByIdQuery } from "@/entities/room";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { FullscreenSpinnerLoader } from "@/shared/ui/spinner-loader";
import { useParams } from "next/navigation";
import { RoomHeader } from "@/widgets/room-header";
import { RoomParticipantsList } from "@/widgets/room-participants-list";
import { useMeQuery } from "@/entities/user/model/useMeQuery";
import { useRoomPresence } from "@/features/room-presence";

export default function RoomPage() {
	const roomId = useParams().id as string;

	const { user } = useMeQuery();

	const { room, isPending } = useRoomByIdQuery({ roomId });
	const { onlineParticipantIds } = useRoomPresence({ roomId, userId: user?.id });

	if (isPending) return <FullscreenSpinnerLoader />;

	if (!room) {
		return <div className="w-full h-screen flex items-center justify-center">Room not found</div>;
	}

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
				<RoomHeader roomId={roomId} roomName={room.name} />

				<div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
					<Card className="border-border/60">
						<CardHeader className="space-y-2">
							<div className="flex items-center justify-between">
								<CardTitle>Match starts in 00:10</CardTitle>
							</div>
							<p className="text-sm text-muted-foreground">Controls: WASD / arrows.</p>
						</CardHeader>
						<CardContent className="space-y-4"></CardContent>
					</Card>

					<aside className="flex flex-col gap-4">
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
					</aside>
				</div>
			</div>
		</div>
	);
}
