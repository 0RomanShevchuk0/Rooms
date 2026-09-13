import type { ReactNode } from "react";
import type { SnakeGameSettings } from "@rooms/contracts/snake-game";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import type { RoomLobbyModel } from "@/features/room-lobby";
import { useSnakeGame } from "../model/useSnakeGame";
import { SnakeControlsHint } from "./SnakeControlsHint";
import { SnakeGameOverDialog } from "./SnakeGameOverDialog";

type SnakeFieldSize = SnakeGameSettings["fieldSize"];

interface SnakeGameProps {
	roomId: string;
	snakeFieldSize: SnakeFieldSize;
	ownParticipantId: string | null;
	lobby: RoomLobbyModel;
	action?: ReactNode;
}

export function SnakeGame({
	roomId,
	snakeFieldSize,
	ownParticipantId,
	lobby,
	action,
}: SnakeGameProps) {
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
				<CardHeader>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<CardTitle>Snake</CardTitle>

						<div className="flex items-center gap-3">
							{lobby.isGameRunning ? (
								<Button disabled>In Progress</Button>
							) : (
								<>
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
								</>
							)}
							{action}
						</div>
					</div>
				</CardHeader>
				<CardContent className="flex flex-col items-center gap-4">
					{/* Square, as wide as the column allows but never taller than what is
					    left of the viewport under the room and card chrome. `min-h-0` lets it
					    shrink again: Konva's inner div carries an explicit pixel height that
					    would otherwise hold the old size open. */}
					<div
						ref={canvasContainerRef}
						className="aspect-square min-h-0 w-[min(100%,calc(100dvh-17rem))]"
					/>
					<SnakeControlsHint />
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
