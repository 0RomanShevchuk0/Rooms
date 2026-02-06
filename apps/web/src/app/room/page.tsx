import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const players = [
	{
		name: "Player 1",
		status: "Ready",
		ping: "12 ms",
		color: "bg-primary",
	},
	{
		name: "Player 2",
		status: "Connecting",
		ping: "—",
		color: "bg-muted-foreground",
	},
];

export default function RoomPage() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
				<header className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Room</p>
						<h1 className="text-2xl font-semibold">#A9K2 — Snake 2P</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm">
							Invite
						</Button>
						<Button size="sm">Ready</Button>
					</div>
				</header>

				<div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
					<Card className="border-border/60">
						<CardHeader className="space-y-2">
							<div className="flex items-center justify-between">
								<CardTitle>Match starts in 00:10</CardTitle>
							</div>
							<p className="text-sm text-muted-foreground">Controls: WASD / arrows.</p>
						</CardHeader>
						<CardContent className="space-y-4"></CardContent>
					</Card>

					<aside className="flex flex-col gap-4">
						<Card className="border-border/60">
							<CardHeader>
								<CardTitle>Players</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{players.map((player) => (
									<div
										key={player.name}
										className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm"
									>
										<div className="flex items-center gap-3">
											<div className={`h-2.5 w-2.5 rounded-full ${player.color}`} />
											<div>
												<p className="font-medium">{player.name}</p>
												<p className="text-xs text-muted-foreground">{player.status}</p>
											</div>
										</div>
										<span className="text-xs text-muted-foreground">{player.ping}</span>
									</div>
								))}
								<Button variant="outline" size="sm" className="w-full">
									Copy room link
								</Button>
							</CardContent>
						</Card>

						<Card className="border-border/60">
							<CardHeader>
								<CardTitle>Room settings</CardTitle>
							</CardHeader>
							<CardContent className="grid gap-2 text-xs text-muted-foreground">
								<div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-2">Speed: medium</div>
								<div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-2">Grid: 12x6</div>
								<div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-2">Play to 3</div>
								<div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-2">Fruits: 1</div>
							</CardContent>
						</Card>
					</aside>
				</div>
			</div>
		</div>
	);
}
