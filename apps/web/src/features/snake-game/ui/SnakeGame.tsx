import { useRoomFromParamsQuery } from "@/app/(protected)/rooms/[id]/useRoomFromParamsQuery";
import { SNAKE_GAME_SOCKET_EVENTS } from "@/entities/snake-game";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useSnakeGame } from "../model/useSnakeGame";
import { useSnakeGameSocket } from "@/shared/lib/realtime/stores/snake-game-socket";

export function SnakeGame() {
	const { roomId } = useRoomFromParamsQuery();

	const { socket: snakeGameSocket } = useSnakeGameSocket();
	const { canvasContainerRef } = useSnakeGame({ roomId });

	return (
		<Card className="border-border/60">
			<CardHeader className="space-y-2">
				<div className="flex items-center justify-between">
					<CardTitle>Match starts in 00:10</CardTitle>
					<button
						onClick={() => {
							snakeGameSocket.emit(SNAKE_GAME_SOCKET_EVENTS.START_GAME, { roomId });
						}}
					>
						Start Game
					</button>
				</div>
				<p className="text-sm text-muted-foreground">Controls: WASD / arrows.</p>
			</CardHeader>
			<CardContent className="space-y-4 flex items-center justify-center">
				<div ref={canvasContainerRef} />
			</CardContent>
		</Card>
	);
}
