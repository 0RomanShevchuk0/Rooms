import EventEmitter from 'node:events';
import { SNAKE_DIRECTION, type SnakeDirection } from './direction';
import { type SnakeGameSettings, type SnakeGameState } from './types';
import { Food } from './food';
import { Snake } from './snake';

type SnakeGameEvents = {
	tick: [state: SnakeGameState];
	gameOver: [state: SnakeGameState];
};

const DEFAULT_GAME_SETTINGS: SnakeGameSettings = {
	fieldSize: { width: 20, height: 20 },
};

export class SnakeGame extends EventEmitter<SnakeGameEvents> {
	private settings: SnakeGameSettings;
	private readonly tickMs: number;
	private gameLoop?: NodeJS.Timeout;
	private food: Food;
	private snake: Snake;
	private gameOver: boolean;

	constructor(settings: SnakeGameSettings = DEFAULT_GAME_SETTINGS) {
		super();

		this.settings = settings;
		this.tickMs = this.resolveTickMs();
		this.gameOver = false;

		const fieldSize = this.settings.fieldSize;
		this.snake = new Snake({
			fieldSize,
			initialDirection: SNAKE_DIRECTION.UP,
			initialSegments: [
				{
					x: Math.floor(fieldSize.width / 2),
					y: Math.floor(fieldSize.height / 2),
				},
			],
		});
		this.food = new Food({ fieldSize });
	}

	changeSnakeDirection(direction: SnakeDirection) {
		this.snake.changeDirection(direction);
	}

	startGame() {
		this.gameLoop = setInterval(() => this.tick(), this.tickMs);
	}

	endGame() {
		this.gameOver = true;
		this.emit('gameOver', this.getGameState());
		this.destroy();
	}

	destroy() {
		if (this.gameLoop) {
			clearInterval(this.gameLoop);
			this.gameLoop = undefined;
		}
		this.removeAllListeners();
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
