export enum DirectionEnum {
	UP = 'up',
	DOWN = 'down',
	LEFT = 'left',
	RIGHT = 'right',
}

export type Position = {
	x: number;
	y: number;
};

export class SnakeGame {
	private snakeLength = 1;
	private snakeDirection: DirectionEnum = DirectionEnum.UP;
	private snakePosition: Position = { x: 10, y: 10 };
	private foodPosition: Position;
	private gameOver = false;
	private readonly fieldSize = 20;
	private readonly tickMs = 140;
	private gameLoop?: NodeJS.Timeout;

	onMove: (position: Position) => void;
	onGameOver: () => void;

	private directionPositions: Record<DirectionEnum, Position> = {
		[DirectionEnum.UP]: { x: 0, y: -1 },
		[DirectionEnum.DOWN]: { x: 0, y: 1 },
		[DirectionEnum.LEFT]: { x: -1, y: 0 },
		[DirectionEnum.RIGHT]: { x: 1, y: 0 },
	};

	constructor(
		onMoveCallback: (position: Position) => void,
		onGameOverCallback: () => void,
	) {
		this.foodPosition = this.generateFoodPosition();

		this.onMove = onMoveCallback;
		this.onGameOver = onGameOverCallback;
	}

	public changeDirection(newDirection: DirectionEnum) {
		this.snakeDirection = newDirection;
	}

	public startGame() {
		this.resetGameState();

		this.gameLoop = setInterval(() => {
			this.moveSnake();
			const isCollision = this.checkCollision();

			if (isCollision) {
				this.endGame();
			}
		}, this.tickMs);
	}

	public endGame() {
		this.gameOver = true;

		if (this.gameLoop) {
			clearInterval(this.gameLoop);
			this.gameLoop = undefined;
		}

		this.onGameOver();
	}

	private generateFoodPosition(): Position {
		const position: Position = {
			x: Math.floor(Math.random() * this.fieldSize),
			y: Math.floor(Math.random() * this.fieldSize),
		};
		return position;
	}

	private moveSnake() {
		const step = this.directionPositions[this.snakeDirection];
		const newPosition: Position = {
			x: this.snakePosition.x + step.x,
			y: this.snakePosition.y + step.y,
		};
		this.snakePosition = newPosition;

		this.onMove(this.snakePosition);
	}

	private checkCollision() {
		const isCollision =
			this.snakePosition.x >= this.fieldSize ||
			this.snakePosition.x < 0 ||
			this.snakePosition.y >= this.fieldSize ||
			this.snakePosition.y < 0;

		return isCollision;
	}

	private resetGameState() {
		this.snakeLength = 1;
		this.snakeDirection = DirectionEnum.UP;
		this.snakePosition = { x: 10, y: 10 };
		this.foodPosition = this.generateFoodPosition();
		this.gameOver = false;
	}
}
