import { RoomWithPlayers } from "@/entities/room";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

interface RoomCardProps {
	room: RoomWithPlayers;
}

export function RoomCard({ room }: RoomCardProps) {
	return (
		<Card className="w-full border-border/60">
			<CardHeader className="space-y-2">
				<div className="flex items-center justify-between">
					<CardTitle>{room.name}</CardTitle>
					<Badge variant="outline">Starts in 00:08</Badge>
				</div>
				<CardDescription>Two-player Snake preview.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-primary" />
						<span>Player 1</span>
					</div>
					<span className="text-muted-foreground">Ready</span>
				</div>
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-muted-foreground" />
						<span>Player 2</span>
					</div>
					<span className="text-muted-foreground">Waiting</span>
				</div>
				<p className="text-xs text-muted-foreground">Controls: WASD / arrows.</p>
			</CardContent>
		</Card>
	);
}
