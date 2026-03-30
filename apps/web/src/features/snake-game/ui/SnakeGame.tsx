import { useRoomFromParamsQuery } from "@/app/(protected)/rooms/[id]/useRoomFromParamsQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useSnakeGame } from "../model/useSnakeGame";
import { SnakeGameOverDialog } from "./SnakeGameOverDialog";

export function SnakeGame() {
	const { roomId } = useRoomFromParamsQuery();
	const { canvasContainerRef, snakeLength, gameStatus, gameOverState, closeGameOverModal, startGame } =
		useSnakeGame({ roomId });

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
				finalSnakeLength={gameOverState?.snakeLength ?? snakeLength}
				onClose={closeGameOverModal}
				onPlayAgain={startGame}
			/>
		</>
	);
}
