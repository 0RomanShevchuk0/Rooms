import EventEmitter from 'node:events';
import { SNAKE_DIRECTION, type SnakeDirection } from './direction';
import { type SnakeGameState } from './types';
import { Food } from './food';
import { Snake } from './snake';

type SnakeGameEvents = {
	tick: [state: SnakeGameState];
	gameOver: [state: SnakeGameState];
};

export class SnakeGame extends EventEmitter<SnakeGameEvents> {
	private readonly fieldSize: number;
	private readonly tickMs: number;
	private gameLoop?: NodeJS.Timeout;
	private food: Food;
	private snake: Snake;
	private gameOver: boolean;

	constructor() {
		super();

		this.fieldSize = 20;
		this.tickMs = this.resolveTickMs();
		this.resetGameState();
	}

	changeSnakeDirection(direction: SnakeDirection) {
		this.snake.changeDirection(direction);
	}

	startGame() {
		this.dispose(false);
		this.resetGameState();

		this.gameLoop = setInterval(() => this.tick(), this.tickMs);
	}

	endGame() {
		this.gameOver = true;
		this.dispose(false);
		this.emit('gameOver', this.getGameState());
	}

	dispose(removeListeners = true) {
		if (this.gameLoop) {
			clearInterval(this.gameLoop);
			this.gameLoop = undefined;
		}
		if (removeListeners) {
			this.removeAllListeners();
		}
	}

	private tick() {
		const nextHead = this.snake.calculateNextPosition();
		const ateFood = this.food.isFoodAt(nextHead);
		const hasCollision = this.snake.hasCollision(nextHead, ateFood);

		if (hasCollision) {
			this.endGame();
			return;
		}

		this.snake.move(nextHead, ateFood);

		if (ateFood) this.food.respawnFood();

		this.emit('tick', this.getGameState());
	}

	private getGameState(): SnakeGameState {
		return {
			gameOver: this.gameOver,
			snakeDirection: this.snake.direction,
			snakeSegments: this.snake.segments,
			foodPosition: this.food.getPosition(),
		};
	}

	private resetGameState() {
		this.gameOver = false;
		this.food = new Food({ fieldSize: this.fieldSize });
		this.snake = new Snake({
			initialSegments: [{ x: this.fieldSize / 2, y: this.fieldSize / 2 }],
			initialDirection: SNAKE_DIRECTION.UP,
			fieldSize: this.fieldSize,
		});
	}

	private resolveTickMs(): number {
		const fallbackTickMs = 140;
		const minTickMs = 60;
		const maxTickMs = 300;
		const parsedTickMs = Number.parseInt(process.env.SNAKE_TICK_MS ?? '', 10);

		if (!Number.isFinite(parsedTickMs)) {
			return fallbackTickMs;
		}

		return Math.min(maxTickMs, Math.max(minTickMs, parsedTickMs));
	}
}
