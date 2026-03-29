import type { SnakePosition } from "@rooms/contracts/snake-game";
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

		this.snakeRect = this.createSnake();
		layer.add(this.snakeRect);
	}

	public updateSnakePosition(position: SnakePosition) {
		const cellSize = this.stage.width() / this.fieldSize;
		this.snakeRect.position({
			x: position.x * cellSize,
			y: position.y * cellSize,
		});
	}

	public destroy() {
		this.stage.destroy();
	}

	private createSnake() {
		const snakeStartX = Math.floor(this.fieldSize / 2) * this.cellSize;
		const snakeStartY = Math.floor(this.fieldSize / 2) * this.cellSize;
		const snakeRect = new Konva.Rect({
			x: snakeStartX,
			y: snakeStartY,
			width: this.cellSize,
			height: this.cellSize,
			fill: "cornflowerblue",
		});

		return snakeRect;
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
