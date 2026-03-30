import EventEmitter from 'node:events';
import { directionPositions } from './constants';
import { SNAKE_DIRECTION, type SnakeDirection } from './direction';
import { type Position, type SnakeGameState } from './types';

type SnakeGameEvents = {
	tick: [state: SnakeGameState];
	gameOver: [state: SnakeGameState];
};

export class SnakeGame extends EventEmitter<SnakeGameEvents> {
	private readonly fieldSize: number;
	private readonly tickMs: number;
	private gameLoop?: NodeJS.Timeout;
	private state: SnakeGameState;

	constructor() {
		super();

		this.fieldSize = 20;
		this.tickMs = 140;
		this.resetGameState();
	}

	public changeDirection(newDirection: SnakeDirection) {
		this.state.snakeDirection = newDirection;
	}

	public startGame() {
		this.resetGameState();

		this.gameLoop = setInterval(() => {
			const nextPosition = this.calculateNextPosition(this.state);
			const isCollision = this.checkCollision(nextPosition);

			if (!isCollision) {
				this.moveSnake(nextPosition);

				const hasEatenFood =
					this.state.snakePosition.x === this.state.foodPosition.x &&
					this.state.snakePosition.y === this.state.foodPosition.y;

				if (hasEatenFood) {
					this.state.snakeLength += 1;
					this.state.foodPosition = this.generateFoodPosition();
				}

				this.emit('tick', this.state);
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

		this.emit('gameOver', this.state);
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
			snakeDirection: SNAKE_DIRECTION.UP,
			snakePosition: { x: 10, y: 10 },
			foodPosition: this.generateFoodPosition(),
			gameOver: false,
		};
	}
}
