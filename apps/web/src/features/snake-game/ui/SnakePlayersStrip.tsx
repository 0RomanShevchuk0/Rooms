import type { RoomParticipant } from "@rooms/contracts/room";
import { cn } from "@/shared/lib/utils";
import type { SnakePlayerStats } from "../model/useSnakePlayerStats";

interface SnakePlayersStripProps {
	participants: RoomParticipant[];
	onlineParticipantIds: Set<string>;
	readyParticipantIds: Set<string>;
	playerStats: SnakePlayerStats;
	ownParticipantId: string | null;
	isGameRunning: boolean;
}

export function SnakePlayersStrip({
	participants,
	onlineParticipantIds,
	readyParticipantIds,
	playerStats,
	ownParticipantId,
	isGameRunning,
}: SnakePlayersStripProps) {
	return (
		<div className="flex flex-wrap gap-2">
			{participants.map((participant) => {
				const isOnline = onlineParticipantIds.has(participant.id);
				const isOwn = participant.id === ownParticipantId;
				const stat = playerStats[participant.id];

				let status: string;
				if (isGameRunning) {
					status = stat ? (stat.alive ? `${stat.length}` : "out") : "—";
				} else if (!isOnline) {
					status = "Offline";
				} else {
					status = readyParticipantIds.has(participant.id) ? "Ready" : "Waiting";
				}

				return (
					<div
						key={participant.id}
						className={cn(
							"flex min-w-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm",
							isOwn ? "border-primary/40 bg-primary/5" : "border-border/60 bg-muted/30",
						)}
					>
						<span
							aria-hidden
							className={cn(
								"size-2 shrink-0 rounded-full",
								isOnline ? "bg-primary" : "bg-muted-foreground/40",
							)}
						/>
						<span className="max-w-32 truncate font-medium">{participant.user.username}</span>
						<span className="shrink-0 text-xs text-muted-foreground">{status}</span>
					</div>
				);
			})}
		</div>
	);
}
