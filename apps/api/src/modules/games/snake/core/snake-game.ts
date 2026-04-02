import EventEmitter from 'node:events';
import { SNAKE_DIRECTION, type SnakeDirection } from './direction';
import { SnakeGameStatePublic, type SnakeGameState } from './types';
import { Food } from './food';
import { Snake } from './snake';

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
	private snake: Snake;

	constructor() {
		super();

		this.fieldSize = 20;
		this.tickMs = 140;
		this.resetGameState();
	}

	changeSnakeDirection(direction: SnakeDirection) {
		this.snake.changeDirection(direction);
	}

	startGame() {
		this.dispose(false);
		this.resetGameState();

		this.gameLoop = setInterval(() => {
			const nextHead = this.snake.calculateNextPosition();
			const ateFood = this.food.isFoodAt(nextHead);
			const hasCollision = this.snake.hasCollision(nextHead, ateFood);

			if (hasCollision) {
				this.endGame();
				return;
			}

			this.snake.move(nextHead, ateFood);

			if (ateFood) this.food.respawnFood();

			this.emit('tick', this.getPublicGameState());
		}, this.tickMs);
	}

	endGame() {
		this.state.gameOver = true;

		if (this.gameLoop) {
			clearInterval(this.gameLoop);
			this.gameLoop = undefined;
		}

		this.emit('gameOver', this.getPublicGameState());
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

	private getPublicGameState(): SnakeGameStatePublic {
		return {
			gameOver: this.state.gameOver,
			snakeDirection: this.snake.direction,
			snakeSegments: this.snake.segments,
			foodPosition: this.food.getPosition(),
		};
	}

	private resetGameState() {
		this.state = {
			gameOver: false,
		};
		this.food = new Food({ fieldSize: this.fieldSize });
		this.snake = new Snake({
			initialSegments: [{ x: this.fieldSize / 2, y: this.fieldSize / 2 }],
			initialDirection: SNAKE_DIRECTION.UP,
			fieldSize: this.fieldSize,
		});
	}
}
