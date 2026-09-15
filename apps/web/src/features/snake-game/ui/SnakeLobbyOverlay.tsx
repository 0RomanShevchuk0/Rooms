interface SnakeLobbyOverlayProps {
	readyCount: number;
	onlineCount: number;
	windowSecondsLeft: number | null;
}

export function SnakeLobbyOverlay({
	readyCount,
	onlineCount,
	windowSecondsLeft,
}: SnakeLobbyOverlayProps) {
	return (
		<div className="absolute inset-0 grid place-content-center gap-1 bg-card/70 text-center">
			<p className="text-base font-semibold">
				{windowSecondsLeft === null
					? "Waiting for players"
					: `Starting in ${windowSecondsLeft}s`}
			</p>
			<p className="text-sm text-muted-foreground">
				{readyCount} of {onlineCount} online ready
			</p>
		</div>
	);
}
