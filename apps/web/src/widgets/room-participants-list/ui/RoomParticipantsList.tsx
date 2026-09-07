import type { RoomParticipant } from "@rooms/contracts/room";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

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
				<CardTitle>Participants ({participants.length})</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{participants.map((participant) => {
					const isOnline = onlineParticipantIds.has(participant.id);
					const isReady = readyParticipantIds.has(participant.id);

					return (
						<div
							key={participant.id}
							className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm"
						>
							<div className="flex min-w-0 items-center gap-3">
								<span
									aria-hidden
									className={cn(
										"size-2.5 shrink-0 rounded-full",
										isOnline ? "bg-primary" : "bg-muted-foreground/40",
									)}
								/>
								<div className="min-w-0">
									<p className="truncate font-medium">{participant.user.username}</p>
									<p className="text-xs text-muted-foreground">
										{isOnline ? "Online" : "Offline"}
									</p>
								</div>
							</div>
							{isReady && (
								<span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
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
