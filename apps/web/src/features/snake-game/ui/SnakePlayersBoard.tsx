import type { RoomParticipant } from "@rooms/contracts/room";
import { cn } from "@/shared/lib/utils";
import type { SnakePlayerStat, SnakePlayerStats } from "../model/useSnakePlayerStats";

interface SnakePlayersBoardProps {
	participants: RoomParticipant[];
	onlineParticipantIds: Set<string>;
	readyParticipantIds: Set<string>;
	playerStats: SnakePlayerStats;
	ownParticipantId: string | null;
	isGameRunning: boolean;
}

interface BoardRow {
	participant: RoomParticipant;
	stat: SnakePlayerStat | undefined;
	isOnline: boolean;
	isReady: boolean;
	isOwn: boolean;
}

// Longest snake first, the fallen at the bottom; ties keep join order.
function compareByMatch(a: BoardRow, b: BoardRow): number {
	const aAlive = a.stat?.alive ? 1 : 0;
	const bAlive = b.stat?.alive ? 1 : 0;
	if (aAlive !== bAlive) return bAlive - aAlive;

	return (b.stat?.length ?? 0) - (a.stat?.length ?? 0);
}

export function SnakePlayersBoard({
	participants,
	onlineParticipantIds,
	readyParticipantIds,
	playerStats,
	ownParticipantId,
	isGameRunning,
}: SnakePlayersBoardProps) {
	const rows: BoardRow[] = participants.map((participant) => ({
		participant,
		stat: playerStats[participant.id],
		isOnline: onlineParticipantIds.has(participant.id),
		isReady: readyParticipantIds.has(participant.id),
		isOwn: participant.id === ownParticipantId,
	}));

	if (isGameRunning) rows.sort(compareByMatch);

	return (
		<div className="overflow-hidden rounded-xl border border-border/60 bg-card">
			<div className="flex items-baseline justify-between px-3.5 pt-2.5 pb-2">
				<span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
					Players
				</span>
				<span className="text-xs text-muted-foreground">{participants.length}</span>
			</div>

			{rows.map(({ participant, stat, isOnline, isReady, isOwn }) => {
				const isDimmed = isGameRunning ? stat !== undefined && !stat.alive : !isOnline;

				return (
					<div
						key={participant.id}
						className={cn(
							"grid h-10.5 grid-cols-[4px_1fr_auto] items-center gap-3 border-t border-border/60 pr-3.5",
							isOwn && "bg-primary/5",
							isDimmed && "opacity-55",
						)}
					>
						<span
							aria-hidden
							className="self-stretch"
							style={{ backgroundColor: isGameRunning ? stat?.color : undefined }}
						/>

						<span className="flex min-w-0 items-center gap-2 font-medium">
							<span className="truncate">{participant.user.username}</span>
							{isOwn && (
								<span className="shrink-0 rounded-full bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
									you
								</span>
							)}
						</span>

						{isGameRunning ? (
							<MatchCell stat={stat} />
						) : (
							<LobbyCell isOnline={isOnline} isReady={isReady} />
						)}
					</div>
				);
			})}
		</div>
	);
}

function LobbyCell({ isOnline, isReady }: { isOnline: boolean; isReady: boolean }) {
	if (!isOnline) return <span className="text-[13px] text-muted-foreground">Offline</span>;
	if (isReady) return <span className="text-[13px] font-semibold text-primary">Ready</span>;

	return <span className="text-[13px] text-muted-foreground">Waiting</span>;
}

function MatchCell({ stat }: { stat: SnakePlayerStat | undefined }) {
	if (!stat) return <span className="text-[13px] text-muted-foreground">—</span>;
	if (!stat.alive) return <span className="text-[13px] text-muted-foreground">out</span>;

	return (
		<span className="min-w-[2ch] text-right text-base font-semibold tabular-nums">
			{stat.length}
		</span>
	);
}
