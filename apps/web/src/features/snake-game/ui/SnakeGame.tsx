import type { SnakeGameSettings } from "@rooms/contracts/snake-game";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useSnakeGame } from "../model/useSnakeGame";
import { SnakeGameOverDialog } from "./SnakeGameOverDialog";

type SnakeFieldSize = SnakeGameSettings["fieldSize"];

interface SnakeGameProps {
	roomId: string;
	snakeFieldSize: SnakeFieldSize;
	ownParticipantId: string | null;
}

export function SnakeGame({ roomId, snakeFieldSize, ownParticipantId }: SnakeGameProps) {
	const {
		canvasContainerRef,
		snakeLength,
		gameStatus,
		gameOverState,
		closeGameOverModal,
		startGame,
	} = useSnakeGame({ roomId, snakeFieldSize, ownParticipantId });

	return (
		<>
			<Card className="border-border/60">
				<CardHeader className="space-y-2">
					<div className="flex items-center justify-between gap-4">
						<div>
							<CardTitle>Snake</CardTitle>
							<p className="text-sm text-muted-foreground">Length: {snakeLength}</p>
						</div>
						<Button onClick={startGame} disabled={gameStatus === "running"}>
							{gameStatus === "running" ? "In Progress" : "Start Game"}
						</Button>
					</div>
					<p className="text-sm text-muted-foreground">Controls: WASD / arrows.</p>
				</CardHeader>
				<CardContent className="flex items-center justify-center">
					<div ref={canvasContainerRef} />
				</CardContent>
			</Card>

			<SnakeGameOverDialog
				open={Boolean(gameOverState)}
				finalSnakeLength={snakeLength}
				onClose={closeGameOverModal}
				onPlayAgain={startGame}
			/>
		</>
	);
}
