import type { SnakeGameState, SnakePosition } from "@rooms/contracts/snake-game";
import Konva from "konva";

interface SnakeCanvasEngineConfig {
	container: HTMLDivElement;
	width: number;
	height: number;
	fieldSize: number;
}

export class SnakeCanvasRenderer {
	private stage: Konva.Stage;
	private layer: Konva.Layer;
	private snakeSegments: Konva.Rect[];
	private foodRect: Konva.Rect;
	private fieldSize: number;
	private cellSize: number;

	constructor({ container, width, height, fieldSize }: SnakeCanvasEngineConfig) {
		this.stage = new Konva.Stage({
			container,
			width,
			height,
		});

		this.layer = new Konva.Layer();
		this.stage.add(this.layer);

		this.fieldSize = fieldSize;
		this.cellSize = this.stage.width() / this.fieldSize;

		const grid = this.generateGrid();
		this.layer.add(grid);

		this.snakeSegments = [];

		this.foodRect = this.createFood({ x: 0, y: 0 });
		this.foodRect.hide();

		this.layer.add(this.foodRect);
	}

	public render(state: SnakeGameState) {
		this.snakeSegments.forEach((segment) => segment.destroy());

		this.snakeSegments = state.snakeSegments.map((segment) => {
			const snakeSegmentRect = this.createSnakeSegment(segment);
			this.layer.add(snakeSegmentRect);
			return snakeSegmentRect;
		});

		this.foodRect = this.foodRect.position({
			x: state.foodPosition.x * this.cellSize,
			y: state.foodPosition.y * this.cellSize,
		});
		this.foodRect.show();
	}

	public destroy() {
		this.stage.destroy();
	}

	private createSnakeSegment(position: SnakePosition) {
		const snakeRect = new Konva.Rect({
			x: position.x * this.cellSize,
			y: position.y * this.cellSize,
			width: this.cellSize,
			height: this.cellSize,
			fill: "cornflowerblue",
		});

		return snakeRect;
	}

	private createFood(position: SnakePosition) {
		const foodRect = new Konva.Rect({
			x: position.x * this.cellSize,
			y: position.y * this.cellSize,
			width: this.cellSize,
			height: this.cellSize,
			fill: "tomato",
		});

		return foodRect;
	}

	private generateGrid() {
		const grid = new Konva.Group();
		for (let row = 0; row < this.fieldSize; row++) {
			for (let col = 0; col < this.fieldSize; col++) {
				const cell = new Konva.Rect({
					x: col * this.cellSize,
					y: row * this.cellSize,
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
