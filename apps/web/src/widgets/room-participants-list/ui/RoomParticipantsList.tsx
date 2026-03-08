import { ParticipantWithUser } from "@/entities/room/model/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface RoomParticipantsListProps {
	participants: ParticipantWithUser[];
	onlineParticipantIds: Set<string>;
}

export function RoomParticipantsList({ participants, onlineParticipantIds }: RoomParticipantsListProps) {
	return (
		<Card className="border-border/60">
			<CardHeader>
				<CardTitle>Participants</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{participants.map((participant) => (
					<div
						key={participant.id}
						className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm"
					>
						<div className="flex items-center gap-3">
							<div
								className={`h-2.5 w-2.5 rounded-full ${
									onlineParticipantIds.has(participant.id) ? "bg-green-500" : "bg-zinc-500"
								}`}
							/>
							<div>
								<p className="font-medium">{participant.user.username}</p>
								<p className="text-xs text-muted-foreground">Waiting</p>
							</div>
						</div>
						<span className="text-xs text-muted-foreground">10 ms</span>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
