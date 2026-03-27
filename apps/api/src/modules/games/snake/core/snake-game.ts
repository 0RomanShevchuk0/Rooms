import { directionPositions } from './constants';
import { DirectionEnum, Position, SnakeGameState } from './types';

export class SnakeGame {
	private readonly fieldSize: number;
	private readonly tickMs: number;
	private gameLoop?: NodeJS.Timeout;
	private state: SnakeGameState;

	onMove: (position: Position) => void;
	onGameOver: () => void;

	constructor(
		onMoveCallback: (position: Position) => void,
		onGameOverCallback: () => void,
	) {
		this.fieldSize = 20;
		this.tickMs = 140;
		this.resetGameState();

		this.onMove = onMoveCallback;
		this.onGameOver = onGameOverCallback;
	}

	public changeDirection(newDirection: DirectionEnum) {
		this.state.snakeDirection = newDirection;
	}

	public startGame() {
		this.resetGameState();

		this.gameLoop = setInterval(() => {
			const nextPosition = this.calculateNextPosition(this.state);
			const isCollision = this.checkCollision(nextPosition);

			if (!isCollision) {
				this.moveSnake(nextPosition);
			} else {
				this.endGame();
			}
		}, this.tickMs);
	}

	public endGame() {
		this.state.gameOver = true;

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

	private calculateNextPosition(gameState: SnakeGameState): Position {
		const step = directionPositions[gameState.snakeDirection];
		const newPosition: Position = {
			x: gameState.snakePosition.x + step.x,
			y: gameState.snakePosition.y + step.y,
		};
		return newPosition;
	}

	private moveSnake(position: Position) {
		this.state.snakePosition = {
			x: position.x,
			y: position.y,
		};

		this.onMove(this.state.snakePosition);
	}

	private checkCollision(snakePosition: Position): boolean {
		const isCollision =
			snakePosition.x >= this.fieldSize ||
			snakePosition.x < 0 ||
			snakePosition.y >= this.fieldSize ||
			snakePosition.y < 0;

		return isCollision;
	}

	private resetGameState() {
		this.state = {
			snakeLength: 1,
			snakeDirection: DirectionEnum.UP,
			snakePosition: { x: 10, y: 10 },
			foodPosition: this.generateFoodPosition(),
			gameOver: false,
		};
	}
}
