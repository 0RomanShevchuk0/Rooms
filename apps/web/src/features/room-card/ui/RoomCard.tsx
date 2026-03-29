import type { RoomWithParticipants } from "@rooms/contracts/room";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

interface RoomCardProps {
	room: RoomWithParticipants;
}

export function RoomCard({ room }: RoomCardProps) {
	return (
		<Card className="w-full h-full border-border/60">
			<CardHeader className="space-y-2">
				<div className="flex items-center justify-between">
					<CardTitle>{room.name}</CardTitle>
					<Badge variant="outline">Starts in 00:08</Badge>
				</div>
				<CardDescription>{room.description}</CardDescription>
			</CardHeader>
			<CardContent className="h-full flex flex-col space-y-4">
				<div className="grow space-y-2">
					{room.participants.map((participant) => (
						<div key={participant.id} className="flex items-center justify-between text-sm">
							<div className="flex items-center gap-2">
								<span className="h-2 w-2 rounded-full bg-primary" />
								<span>{participant.user.username}</span>
							</div>
							<span className="text-muted-foreground">Ready</span>
						</div>
					))}
				</div>
				<p className="text-xs text-muted-foreground">Controls: WASD / arrows.</p>
			</CardContent>
		</Card>
	);
}
