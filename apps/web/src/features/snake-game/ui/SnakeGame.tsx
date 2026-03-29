import { useRoomFromParamsQuery } from "@/app/(protected)/rooms/[id]/useRoomFromParamsQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useSnakeGame } from "../model/useSnakeGame";
import { useSnakeGameSocket } from "@/shared/lib/realtime/stores/snake-game-socket";
import { SNAKE_GAME_SOCKET_EVENTS, type SnakeRoomPayload } from "@rooms/contracts/snake-game";

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
							const payload: SnakeRoomPayload = { roomId };
							snakeGameSocket.emit(SNAKE_GAME_SOCKET_EVENTS.START_GAME, payload);
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
