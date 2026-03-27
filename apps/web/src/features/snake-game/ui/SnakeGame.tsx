import { useRoomFromParamsQuery } from "@/app/(protected)/rooms/[id]/useRoomFromParamsQuery";
import { SNAKE_GAME_SOCKET_EVENTS } from "@/entities/snake-game";
import { useSnakeGameSocket } from "@/shared/lib/realtime/stores/snake-game-socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import Konva from "konva";
import { useEffect, useRef } from "react";

export function SnakeGame() {
	const { roomId } = useRoomFromParamsQuery();
	const { socket: snakeGameSocket } = useSnakeGameSocket();
	const canvasContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const canvasContainer = canvasContainerRef.current;
		if (!canvasContainer) return;

		const stage = new Konva.Stage({
			container: canvasContainer,
			width: 500,
			height: 500,
		});

		// Create a layer
		const layer = new Konva.Layer();
		stage.add(layer);

		const fieldSize = 20;
		const cellSize = stage.width() / fieldSize;

		const grid = new Konva.Group();
		for (let row = 0; row < fieldSize; row++) {
			for (let col = 0; col < fieldSize; col++) {
				const cell = new Konva.Rect({
					x: col * cellSize,
					y: row * cellSize,
					width: cellSize,
					height: cellSize,
					stroke: "#ddd",
					strokeWidth: 1,
				});
				grid.add(cell);
			}
		}
		layer.add(grid);

		const snakeRect = new Konva.Rect({
			x: 250,
			y: 250,
			width: cellSize,
			height: cellSize,
			fill: "cornflowerblue",
		});
		layer.add(snakeRect);

		snakeGameSocket.on(SNAKE_GAME_SOCKET_EVENTS.SNAKE_MOVED, (gameState) => {
			console.log("Received game state update:", gameState);
			snakeRect.position({
				x: gameState.x * cellSize,
				y: gameState.y * cellSize,
			});
		});
		snakeGameSocket.on(SNAKE_GAME_SOCKET_EVENTS.GAME_OVER, () => {
			alert("Game Over!");
			console.log("Game over received!!!!!!!");
		});

		if (!canvasContainerRef.current) return;
		window.onkeydown = (event) => {
			const directionMap: Record<string, string> = {
				ArrowUp: "up",
				ArrowDown: "down",
				ArrowLeft: "left",
				ArrowRight: "right",
				w: "up",
				s: "down",
				a: "left",
				d: "right",
			};

			const direction = directionMap[event.key];
			console.log("🚀 ~ RoomPage ~ direction:", direction);
			if (direction) {
				snakeGameSocket.emit(SNAKE_GAME_SOCKET_EVENTS.CHANGE_DIRECTION, { direction, roomId });
			}
		};

		return () => {
			snakeGameSocket.off(SNAKE_GAME_SOCKET_EVENTS.SNAKE_MOVED);
			snakeGameSocket.off(SNAKE_GAME_SOCKET_EVENTS.GAME_OVER);
		};
	}, [snakeGameSocket, roomId]);

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
