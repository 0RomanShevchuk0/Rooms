import type { SnakeGameSettings, SnakeGameState, SnakePosition } from "@rooms/contracts/snake-game";
import Konva from "konva";

type SnakeFieldSize = SnakeGameSettings["fieldSize"];

interface SnakeCanvasEngineConfig {
	container: HTMLDivElement;
	width: number;
	height: number;
	fieldSize: SnakeFieldSize;
}

export class SnakeCanvasRenderer {
	private stage: Konva.Stage;
	private layer: Konva.Layer;
	private snakeSegments: Konva.Rect[];
	private foodRects: Konva.Rect[];
	private fieldSize: SnakeFieldSize;
	private cellSize: number;
	private gridOffsetX: number;
	private gridOffsetY: number;

	constructor({ container, width, height, fieldSize }: SnakeCanvasEngineConfig) {
		this.stage = new Konva.Stage({
			container,
			width,
			height,
		});

		this.layer = new Konva.Layer();
		this.stage.add(this.layer);

		this.fieldSize = fieldSize;
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

		this.snakeSegments = state.snakeSegments.map((segment) => {
			const snakeSegmentRect = this.createSnakeSegment(segment);
			this.layer.add(snakeSegmentRect);
			return snakeSegmentRect;
		});

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

	private createSnakeSegment(position: SnakePosition) {
		const snakeRect = new Konva.Rect({
			x: this.gridOffsetX + position.x * this.cellSize,
			y: this.gridOffsetY + position.y * this.cellSize,
			width: this.cellSize,
			height: this.cellSize,
			fill: "cornflowerblue",
		});

		return snakeRect;
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
