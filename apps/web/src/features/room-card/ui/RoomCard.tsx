import type { RoomWithParticipants } from "@rooms/contracts/room";
import { ArrowRight } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { getUserInitial } from "@/shared/lib/user";

const MAX_SHOWN_PARTICIPANTS = 4;

interface RoomCardProps {
	room: RoomWithParticipants;
}

export function RoomCard({ room }: RoomCardProps) {
	const participantCount = room.participants.length;
	const shownParticipants = room.participants.slice(0, MAX_SHOWN_PARTICIPANTS);
	const hiddenCount = participantCount - shownParticipants.length;

	return (
		<Card className="h-full w-full border-border/60 transition-colors group-hover:bg-muted/40">
			<CardHeader>
				<CardTitle className="truncate">{room.name}</CardTitle>
				{room.description ? (
					<CardDescription className="line-clamp-2">{room.description}</CardDescription>
				) : null}
			</CardHeader>
			<CardContent className="mt-auto flex items-center gap-3">
				<div className="flex -space-x-2">
					{shownParticipants.map((participant) => (
						<span
							key={participant.id}
							title={participant.user.username}
							className="inline-flex size-7 items-center justify-center rounded-full border border-card bg-primary/10 text-xs font-semibold text-primary"
						>
							{getUserInitial(participant.user.username)}
						</span>
					))}
					{hiddenCount > 0 && (
						<span className="inline-flex size-7 items-center justify-center rounded-full border border-card bg-muted text-xs font-medium text-muted-foreground">
							+{hiddenCount}
						</span>
					)}
				</div>
				<p className="text-sm text-muted-foreground">
					{participantCount === 1 ? "1 participant" : `${participantCount} participants`}
				</p>
			</CardContent>
			<CardFooter className="gap-1.5 text-sm text-muted-foreground">
				Open room
				<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
			</CardFooter>
		</Card>
	);
}
