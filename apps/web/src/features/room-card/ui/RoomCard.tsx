import type { ReactNode } from "react";
import type { RoomWithParticipants } from "@rooms/contracts/room";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { ROUTES } from "@/shared/routes";
import { getUserInitial } from "@/shared/lib/user";

const MAX_SHOWN_PARTICIPANTS = 4;

interface RoomCardProps {
	room: RoomWithParticipants;
	action?: ReactNode;
}

export function RoomCard({ room, action }: RoomCardProps) {
	const participantCount = room.participants.length;
	const shownParticipants = room.participants.slice(0, MAX_SHOWN_PARTICIPANTS);
	const hiddenCount = participantCount - shownParticipants.length;

	return (
		<Card className="group relative h-full w-full border-border/60 transition-colors hover:bg-muted/40">
			<CardHeader>
				<CardTitle className="truncate">{room.name}</CardTitle>
				{room.description ? (
					<CardDescription className="line-clamp-2">{room.description}</CardDescription>
				) : null}
				{action ? (
					// Negative margins pull the icon button's box out to the padding
					// line, so the glyph lines up with the title instead of the
					// invisible 32px hit area around it.
					<CardAction className="relative z-10 -mt-1 -mr-2">{action}</CardAction>
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

			{/* Covers the card so the whole surface is one link, leaving the menu
			    above it clickable — a button nested inside an anchor is invalid. */}
			<Link
				href={ROUTES.rooms.room(room.id)}
				aria-label={`Open ${room.name}`}
				className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
			/>
		</Card>
	);
}
