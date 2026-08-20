import type { SnakeGameSettings } from "@rooms/contracts/snake-game";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import type { RoomLobbyModel } from "@/features/room-lobby";
import { useSnakeGame } from "../model/useSnakeGame";
import { SnakeGameOverDialog } from "./SnakeGameOverDialog";

type SnakeFieldSize = SnakeGameSettings["fieldSize"];

interface SnakeGameProps {
	roomId: string;
	snakeFieldSize: SnakeFieldSize;
	ownParticipantId: string | null;
	lobby: RoomLobbyModel;
}

export function SnakeGame({ roomId, snakeFieldSize, ownParticipantId, lobby }: SnakeGameProps) {
	const { canvasContainerRef, snakeLength, gameOverState, closeGameOverModal } = useSnakeGame({
		roomId,
		snakeFieldSize,
		ownParticipantId,
		isGameRunning: lobby.isGameRunning,
	});

	const isGathering = lobby.windowSecondsLeft !== null;
	const canPlay = ownParticipantId !== null;

	const playAgain = () => {
		closeGameOverModal();
		lobby.setReady(true);
	};

	return (
		<>
			<Card className="border-border/60">
				<CardHeader className="space-y-2">
					<div className="flex items-center justify-between gap-4">
						<div>
							<CardTitle>Snake</CardTitle>
							<p className="text-sm text-muted-foreground">Length: {snakeLength}</p>
						</div>

						{lobby.isGameRunning ? (
							<Button disabled>In Progress</Button>
						) : (
							<div className="flex items-center gap-3">
								{isGathering && (
									<p className="text-sm text-muted-foreground">
										Starting in {lobby.windowSecondsLeft}s
									</p>
								)}
								<Button
									variant={lobby.isOwnReady ? "outline" : "default"}
									disabled={!canPlay}
									onClick={() => lobby.setReady(!lobby.isOwnReady)}
								>
									{lobby.isOwnReady ? "Not Ready" : "Ready"}
								</Button>
								{isGathering && lobby.isOwnReady && (
									<Button onClick={lobby.startNow}>Start Now</Button>
								)}
							</div>
						)}
					</div>
					<p className="text-sm text-muted-foreground">
						{lobby.isGameRunning
							? "Controls: WASD / arrows."
							: "Ready up — the game starts once the timer runs out."}
					</p>
				</CardHeader>
				<CardContent className="flex items-center justify-center">
					<div ref={canvasContainerRef} />
				</CardContent>
			</Card>

			<SnakeGameOverDialog
				open={Boolean(gameOverState)}
				finalSnakeLength={snakeLength}
				onClose={closeGameOverModal}
				onPlayAgain={playAgain}
			/>
		</>
	);
}
