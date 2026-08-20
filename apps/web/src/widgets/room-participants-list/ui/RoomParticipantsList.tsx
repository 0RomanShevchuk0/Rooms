import type { RoomParticipant } from "@rooms/contracts/room";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface RoomParticipantsListProps {
	participants: RoomParticipant[];
	onlineParticipantIds: Set<string>;
	readyParticipantIds: Set<string>;
}

export function RoomParticipantsList({
	participants,
	onlineParticipantIds,
	readyParticipantIds,
}: RoomParticipantsListProps) {
	return (
		<Card className="border-border/60">
			<CardHeader>
				<CardTitle>Participants</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{participants.map((participant) => {
					const isOnline = onlineParticipantIds.has(participant.id);
					const isReady = readyParticipantIds.has(participant.id);

					return (
						<div
							key={participant.id}
							className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm"
						>
							<div className="flex items-center gap-3">
								<div
									className={`h-2.5 w-2.5 rounded-full ${
										isOnline ? "bg-green-500" : "bg-zinc-500"
									}`}
								/>
								<div>
									<p className="font-medium">{participant.user.username}</p>
									<p className="text-xs text-muted-foreground">
										{isReady ? "Ready" : "Waiting"}
									</p>
								</div>
							</div>
							{isReady && (
								<span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-600">
									Ready
								</span>
							)}
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
