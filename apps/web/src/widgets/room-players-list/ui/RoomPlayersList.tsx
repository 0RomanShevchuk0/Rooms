import type { User } from "@/entities/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface RoomPlayersListProps {
	players: User[];
	onlinePlayerIds: Set<string>;
}

export function RoomPlayersList({ players, onlinePlayerIds }: RoomPlayersListProps) {
	const playersList = players.map((player) => (
		<div
			key={player.id}
			className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm"
		>
			<div className="flex items-center gap-3">
				<div
					className={`h-2.5 w-2.5 rounded-full ${
						onlinePlayerIds.has(player.id) ? "bg-green-500" : "bg-zinc-500"
					}`}
				/>
				<div>
					<p className="font-medium">{player.username}</p>
					<p className="text-xs text-muted-foreground">Waiting</p>
				</div>
			</div>
			<span className="text-xs text-muted-foreground">10 ms</span>
		</div>
	));

	return (
		<Card className="border-border/60">
			<CardHeader>
				<CardTitle>Players</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">{playersList}</CardContent>
		</Card>
	);
}
