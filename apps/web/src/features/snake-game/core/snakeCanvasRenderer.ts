import type {
	SnakeGameSettings,
	SnakeGameState,
	SnakePlayerState,
	SnakePosition,
} from "@rooms/contracts/snake-game";
import Konva from "konva";

type SnakeFieldSize = SnakeGameSettings["fieldSize"];

const OWN_SNAKE_COLOR = "cornflowerblue";
const OTHER_SNAKE_COLORS = ["mediumseagreen", "orchid", "goldenrod", "darkorange"];
const DEAD_SNAKE_OPACITY = 0.35;

interface SnakeCanvasEngineConfig {
	container: HTMLDivElement;
	width: number;
	height: number;
	fieldSize: SnakeFieldSize;
	ownParticipantId: string | null;
}

export class SnakeCanvasRenderer {
	private stage: Konva.Stage;
	private layer: Konva.Layer;
	private snakeSegments: Konva.Rect[];
	private foodRects: Konva.Rect[];
	private fieldSize: SnakeFieldSize;
	private ownParticipantId: string | null;
	private cellSize: number;
	private gridOffsetX: number;
	private gridOffsetY: number;

	constructor({ container, width, height, fieldSize, ownParticipantId }: SnakeCanvasEngineConfig) {
		this.stage = new Konva.Stage({
			container,
			width,
			height,
		});

		this.layer = new Konva.Layer();
		this.stage.add(this.layer);

		this.fieldSize = fieldSize;
		this.ownParticipantId = ownParticipantId;
		this.cellSize = Math.min(
			this.stage.width() / this.fieldSize.width,
			this.stage.height() / this.fieldSize.height,
		);

		const gridWidth = this.fieldSize.width * this.cellSize;
		const gridHeight = this.fieldSize.height * this.cellSize;
		this.gridOffsetX = (this.stage.width() - gridWidth) / 2;
		this.gridOffsetY = (this.stage.height() - gridHeight) / 2;

		const grid = this.generateGrid();
		this.layer.add(grid);

		this.snakeSegments = [];
		this.foodRects = [];
	}

	render(state: SnakeGameState) {
		this.snakeSegments.forEach((segment) => segment.destroy());
		this.foodRects.forEach((foodRect) => foodRect.destroy());

		this.snakeSegments = state.snakes.flatMap((snake, snakeIndex) =>
			snake.segments.map((segment) => {
				const snakeSegmentRect = this.createSnakeSegment(segment, snake, snakeIndex);
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

	private createSnakeSegment(
		position: SnakePosition,
		snake: SnakePlayerState,
		snakeIndex: number,
	) {
		const snakeRect = new Konva.Rect({
			x: this.gridOffsetX + position.x * this.cellSize,
			y: this.gridOffsetY + position.y * this.cellSize,
			width: this.cellSize,
			height: this.cellSize,
			fill: this.resolveSnakeColor(snake, snakeIndex),
			opacity: snake.alive ? 1 : DEAD_SNAKE_OPACITY,
		});

		return snakeRect;
	}

	private resolveSnakeColor(snake: SnakePlayerState, snakeIndex: number) {
		if (snake.participantId === this.ownParticipantId) {
			return OWN_SNAKE_COLOR;
		}

		return OTHER_SNAKE_COLORS[snakeIndex % OTHER_SNAKE_COLORS.length];
	}

	private createFood(position: SnakePosition) {
		const foodRect = new Konva.Rect({
			x: this.gridOffsetX + position.x * this.cellSize,
			y: this.gridOffsetY + position.y * this.cellSize,
			width: this.cellSize,
			height: this.cellSize,
			fill: "tomato",
		});

		return foodRect;
	}

	private generateGrid() {
		const grid = new Konva.Group();
		for (let row = 0; row < this.fieldSize.height; row++) {
			for (let col = 0; col < this.fieldSize.width; col++) {
				const cell = new Konva.Rect({
					x: this.gridOffsetX + col * this.cellSize,
					y: this.gridOffsetY + row * this.cellSize,
					width: this.cellSize,
					height: this.cellSize,
					stroke: "#ddd",
					strokeWidth: 1,
				});
				grid.add(cell);
			}
		}

		return grid;
	}
}
