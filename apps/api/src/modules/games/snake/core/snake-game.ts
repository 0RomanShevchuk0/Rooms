import EventEmitter from 'node:events';
import {
	directionOpposites,
	SNAKE_DIRECTION,
	type SnakeDirection,
} from './direction';
import { directionPositions } from './constants';
import { type SnakeGameSettings, type SnakeGameState } from './types';
import { Snake } from './snake';
import { FoodManager } from './food-manager';
import {
	chooseMockPlayerDirection,
	createMockPlayerSegments,
	isMockPlayerEnabled,
	MOCK_PLAYER_ID,
	MOCK_PLAYER_INITIAL_DIRECTION,
} from './mock-player';

type SnakeGameEvents = {
	tick: [state: SnakeGameState];
	gameOver: [state: SnakeGameState];
};

interface SnakeGameProps {
	participantIds: string[];
	settings: SnakeGameSettings;
}
export class SnakeGame extends EventEmitter<SnakeGameEvents> {
	private settings: SnakeGameSettings;
	private readonly tickMs: number;
	private gameLoop?: NodeJS.Timeout;
	private foodManager: FoodManager;

	private readonly snakes = new Map<string, Snake>();
	/** Null when the mock player is switched off; it is scenery, not a player. */
	private readonly mockPlayerSnake: Snake | null = null;
	private gameOver = false;

	constructor({ participantIds, settings }: SnakeGameProps) {
		super();

		this.settings = settings;
		this.tickMs = this.resolveTickMs();

		const fieldSize = this.settings.fieldSize;

		participantIds.forEach((participantId, index) => {
			const initialDirection = SNAKE_DIRECTION.UP;
			const initialSegments = [
				{
					x: Math.floor(fieldSize.width / 2),
					y: Math.floor(fieldSize.height / 2) + index,
				},
			];

			this.snakes.set(
				participantId,
				new Snake({ fieldSize, initialDirection, initialSegments }),
			);
		});

		if (isMockPlayerEnabled()) {
			// Below everyone else, so it does not spawn on top of a player.
			const row = Math.floor(fieldSize.height / 2) + participantIds.length;

			this.mockPlayerSnake = new Snake({
				fieldSize,
				initialDirection: MOCK_PLAYER_INITIAL_DIRECTION,
				initialSegments: createMockPlayerSegments(fieldSize, row),
			});
			this.snakes.set(MOCK_PLAYER_ID, this.mockPlayerSnake);
		}

		this.foodManager = new FoodManager({
			foodAmount: this.settings.foodAmount,
			fieldSize: this.settings.fieldSize,
		});
	}

	changeSnakeDirection(participantId: string, direction: SnakeDirection) {
		const snake = this.snakes.get(participantId);
		if (!snake?.alive) return;

		snake.changeDirection(direction);
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
		this.steerMockPlayer();

		this.snakes.forEach((snake) => {
			if (!snake.alive) return;

			const nextHead = snake.calculateNextPosition();
			const eatenFood = this.foodManager.findFoodByPosition(nextHead);
			const ateFood = !!eatenFood;
			const hasCollision = snake.hasCollision(nextHead, ateFood);

			if (hasCollision) {
				snake.kill();
				return;
			}

			snake.move(nextHead, ateFood);

			if (eatenFood) eatenFood.respawnFood();
		});

		// The mock player is scenery: it must not hold a match open by itself.
		const hasAlivePlayers = [...this.snakes.values()].some(
			(snake) => snake.alive && snake !== this.mockPlayerSnake,
		);
		if (!hasAlivePlayers) {
			this.endGame();
			return;
		}

		this.emit('tick', this.getGameState());
	}

	private steerMockPlayer() {
		const snake = this.mockPlayerSnake;
		if (!snake?.alive) return;

		snake.changeDirection(
			chooseMockPlayerDirection({
				currentDirection: snake.direction,
				isSurvivable: (direction) =>
					this.isDirectionSurvivable(snake, direction),
			}),
		);
	}

	private isDirectionSurvivable(
		snake: Snake,
		direction: SnakeDirection,
	): boolean {
		if (directionOpposites[direction] === snake.direction) {
			return false;
		}

		const step = directionPositions[direction];
		const head = snake.segments[0];
		const nextHead = { x: head.x + step.x, y: head.y + step.y };

		return !snake.hasCollision(nextHead, false);
	}

	private getGameState(): SnakeGameState {
		return {
			gameOver: this.gameOver,
			snakes: [...this.snakes].map(([participantId, snake]) => ({
				participantId,
				direction: snake.direction,
				segments: snake.segments,
				alive: snake.alive,
			})),
			foodPositions: this.foodManager.getFoodPositions(),
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
