import EventEmitter from 'node:events';
import { directionPositions } from './constants';
import {
	directionOpposites,
	SNAKE_DIRECTION,
	type SnakeDirection,
} from './direction';
import {
	SnakeGameStatePublic,
	type Position,
	type SnakeGameState,
} from './types';
import { Food } from './food';

type SnakeGameEvents = {
	tick: [state: SnakeGameStatePublic];
	gameOver: [state: SnakeGameStatePublic];
};

export class SnakeGame extends EventEmitter<SnakeGameEvents> {
	private readonly fieldSize: number;
	private readonly tickMs: number;
	private gameLoop?: NodeJS.Timeout;
	private state: SnakeGameState;
	private food: Food;

	constructor() {
		super();

		this.fieldSize = 20;
		this.tickMs = 140;
		this.resetGameState();
	}

	public changeDirection(newDirection: SnakeDirection) {
		if (directionOpposites[newDirection] === this.state.snakeDirection) {
			return;
		}
		this.state.snakeDirection = newDirection;
	}

	public startGame() {
		this.dispose(false);
		this.resetGameState();

		this.gameLoop = setInterval(() => {
			const nextHead = this.calculateNextPosition(this.state);
			const ateFood = this.food.isFoodAt(nextHead);
			const isCollision = this.checkCollision(nextHead, ateFood);

			if (isCollision) {
				this.endGame();
				return;
			}

			this.addHead(nextHead);
			if (!ateFood) this.removeTail();

			if (ateFood) this.food.respawnFood();

			this.emit('tick', this.getPublicGameState());
		}, this.tickMs);
	}

	public endGame() {
		this.state.gameOver = true;

		if (this.gameLoop) {
			clearInterval(this.gameLoop);
			this.gameLoop = undefined;
		}

		this.emit('gameOver', this.getPublicGameState());
	}

	public dispose(removeListeners = true) {
		if (this.gameLoop) {
			clearInterval(this.gameLoop);
			this.gameLoop = undefined;
		}
		if (removeListeners) {
			this.removeAllListeners();
		}
	}

	private getPublicGameState(): SnakeGameStatePublic {
		return {
			...this.state,
			foodPosition: this.food.getPosition(),
		};
	}

	private addHead(position: Position) {
		this.state.snakeSegments.unshift(position);
	}

	private removeTail() {
		this.state.snakeSegments.pop();
	}

	private calculateNextPosition(gameState: SnakeGameState): Position {
		const step = directionPositions[gameState.snakeDirection];
		const snakeHead = gameState.snakeSegments[0];
		const newPosition: Position = {
			x: snakeHead.x + step.x,
			y: snakeHead.y + step.y,
		};
		return newPosition;
	}

	private checkCollision(nextHead: Position, considerTail: boolean): boolean {
		const isBordersCollision =
			nextHead.x >= this.fieldSize ||
			nextHead.x < 0 ||
			nextHead.y >= this.fieldSize ||
			nextHead.y < 0;

		const isSelfCollision = this.state.snakeSegments.some(
			(segment, index) =>
				index !== 0 &&
				(considerTail || index !== this.state.snakeSegments.length - 1) &&
				segment.x === nextHead.x &&
				segment.y === nextHead.y,
		);

		return isBordersCollision || isSelfCollision;
	}

	private resetGameState() {
		const mockSegments = [
			{ x: 10, y: 4 },
			{ x: 10, y: 5 },
			{ x: 10, y: 6 },
			{ x: 10, y: 7 },
			{ x: 10, y: 8 },
			{ x: 10, y: 9 },
			{ x: 10, y: 10 },
			{ x: 10, y: 11 },
			{ x: 10, y: 12 },
			{ x: 10, y: 13 },
			{ x: 10, y: 14 },
			{ x: 10, y: 15 },
			{ x: 10, y: 16 },
			{ x: 10, y: 17 },
			{ x: 10, y: 18 },
			{ x: 10, y: 19 },
		];
		this.state = {
			snakeSegments: mockSegments,
			snakeDirection: SNAKE_DIRECTION.UP,
			gameOver: false,
		};
		this.food = new Food({ fieldSize: this.fieldSize });
	}
}
