import type {
	SnakeGameSettings,
	SnakeGameState,
	SnakePlayerState,
	SnakePosition,
} from "@rooms/contracts/snake-game";
import Konva from "konva";

type SnakeFieldSize = SnakeGameSettings["fieldSize"];

export interface SnakeCanvasSize {
	width: number;
	height: number;
}

const DEAD_SNAKE_OPACITY = 0.35;

interface SnakeCanvasEngineConfig {
	container: HTMLDivElement;
	size: SnakeCanvasSize;
	fieldSize: SnakeFieldSize;
}

export class SnakeCanvasRenderer {
	private stage: Konva.Stage;
	private layer: Konva.Layer;
	private grid: Konva.Group;
	private snakeSegments: Konva.Rect[] = [];
	private foodRects: Konva.Rect[] = [];
	private lastState: SnakeGameState | null = null;
	private fieldSize: SnakeFieldSize;
	private cellSize = 0;
	private gridOffsetX = 0;
	private gridOffsetY = 0;

	constructor({ container, size, fieldSize }: SnakeCanvasEngineConfig) {
		this.stage = new Konva.Stage({ container, ...size });
		this.layer = new Konva.Layer();
		this.stage.add(this.layer);

		this.fieldSize = fieldSize;

		this.grid = this.buildGrid();
		this.layer.add(this.grid);
	}

	resize(size: SnakeCanvasSize) {
		this.stage.size(size);

		this.grid.destroy();
		this.grid = this.buildGrid();
		this.layer.add(this.grid);
		this.grid.moveToBottom();

		if (this.lastState) {
			this.render(this.lastState);
		} else {
			this.layer.batchDraw();
		}
	}

	render(state: SnakeGameState) {
		this.lastState = state;

		this.snakeSegments.forEach((segment) => segment.destroy());
		this.foodRects.forEach((foodRect) => foodRect.destroy());

		this.snakeSegments = state.snakes.flatMap((snake) =>
			snake.segments.map((segment) => {
				const snakeSegmentRect = this.createSnakeSegment(segment, snake);
				this.layer.add(snakeSegmentRect);
				return snakeSegmentRect;
			}),
		);

		this.foodRects = state.foodPositions.map((position) => {
			const foodRect = this.createFood(position);
			this.layer.add(foodRect);
			return foodRect;
		});

		this.layer.batchDraw();
	}

	destroy() {
		this.stage.destroy();
	}

	private createSnakeSegment(position: SnakePosition, snake: SnakePlayerState) {
		return new Konva.Rect({
			x: this.gridOffsetX + position.x * this.cellSize,
			y: this.gridOffsetY + position.y * this.cellSize,
			width: this.cellSize,
			height: this.cellSize,
			fill: snake.color,
			opacity: snake.alive ? 1 : DEAD_SNAKE_OPACITY,
		});
	}

	private createFood(position: SnakePosition) {
		return new Konva.Rect({
			x: this.gridOffsetX + position.x * this.cellSize,
			y: this.gridOffsetY + position.y * this.cellSize,
			width: this.cellSize,
			height: this.cellSize,
			fill: "tomato",
		});
	}

	/** Recomputes the cell size for the current stage and draws the grid for it. */
	private buildGrid() {
		this.cellSize = Math.min(
			this.stage.width() / this.fieldSize.width,
			this.stage.height() / this.fieldSize.height,
		);

		const gridWidth = this.fieldSize.width * this.cellSize;
		const gridHeight = this.fieldSize.height * this.cellSize;
		this.gridOffsetX = (this.stage.width() - gridWidth) / 2;
		this.gridOffsetY = (this.stage.height() - gridHeight) / 2;

		const grid = new Konva.Group();
		for (let row = 0; row < this.fieldSize.height; row++) {
			for (let col = 0; col < this.fieldSize.width; col++) {
				grid.add(
					new Konva.Rect({
						x: this.gridOffsetX + col * this.cellSize,
						y: this.gridOffsetY + row * this.cellSize,
						width: this.cellSize,
						height: this.cellSize,
						stroke: "#ddd",
						strokeWidth: 1,
					}),
				);
			}
		}

		return grid;
	}
}
