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
	private snakeRect: Konva.Rect;
	private foodRect: Konva.Rect;
	private fieldSize: number;
	private cellSize: number;

	constructor({ container, width, height, fieldSize }: SnakeCanvasEngineConfig) {
		this.stage = new Konva.Stage({
			container,
			width,
			height,
		});

		const layer = new Konva.Layer();
		this.stage.add(layer);

		this.fieldSize = fieldSize;
		this.cellSize = this.stage.width() / this.fieldSize;

		const grid = this.generateGrid();
		layer.add(grid);

		this.snakeRect = this.createSnake({ x: 0, y: 0 });
		this.foodRect = this.createFood({ x: 0, y: 0 });
		this.snakeRect.hide();
		this.foodRect.hide();

		layer.add(this.snakeRect);
		layer.add(this.foodRect);
	}

	public render(state: SnakeGameState) {
		this.snakeRect = this.snakeRect.position({
			x: state.snakePosition.x * this.cellSize,
			y: state.snakePosition.y * this.cellSize,
		});
		this.foodRect = this.foodRect.position({
			x: state.foodPosition.x * this.cellSize,
			y: state.foodPosition.y * this.cellSize,
		});
		this.snakeRect.show();
		this.foodRect.show();
	}

	public destroy() {
		this.stage.destroy();
	}

	private createSnake(position: SnakePosition) {
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
