import EventEmitter from 'node:events';
import {
	directionOpposites,
	SNAKE_DIRECTION,
	type SnakeDirection,
} from './direction';
import { directionPositions } from './constants';
import {
	type Position,
	type SnakeGameSettings,
	type SnakeGameState,
} from './types';
import { Snake } from './snake';
import { FoodManager } from './food-manager';
import type { Food } from './food';
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

/** What a snake intends to do this tick, decided before anyone has moved. */
interface SnakeMove {
	snake: Snake;
	nextHead: Position;
	eatenFood: Food | null;
	isFatal: boolean;
}

function isSamePosition(first: Position, second: Position): boolean {
	return first.x === second.x && first.y === second.y;
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

		// Side by side rather than in single file: everyone heads up, so a column
		// would put each snake in the one ahead of it on the very first tick.
		participantIds.forEach((participantId, index) => {
			const initialDirection = SNAKE_DIRECTION.UP;
			const initialSegments = [
				{
					x: this.resolveSpawnColumn(index, participantIds.length),
					y: Math.floor(fieldSize.height / 2),
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

		this.applyMoves(this.planMoves());

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

	/** Spread around the middle with a cell to spare between neighbours. */
	private resolveSpawnColumn(index: number, playerCount: number): number {
		const centre = Math.floor(this.settings.fieldSize.width / 2);
		const offset = (index - Math.floor((playerCount - 1) / 2)) * 2;

		return Math.min(
			Math.max(centre + offset, 0),
			this.settings.fieldSize.width - 1,
		);
	}

	/**
	 * Every snake decides against the field as it stands, before anyone has
	 * moved. Deciding and moving in one pass would let whoever comes first in
	 * the map walk into a board the others have not seen yet.
	 */
	private planMoves(): SnakeMove[] {
		const aliveSnakes = [...this.snakes.values()].filter(
			(snake) => snake.alive,
		);

		const moves = aliveSnakes.map((snake) => {
			const nextHead = snake.calculateNextPosition();
			const eatenFood = this.foodManager.findFoodByPosition(nextHead);
			const otherSnakes = aliveSnakes.filter(
				(otherSnake) => otherSnake !== snake,
			);

			return {
				snake,
				nextHead,
				eatenFood,
				isFatal: snake.hasCollision(nextHead, !!eatenFood, otherSnakes),
			};
		});

		// Two heads going for the same empty cell see nothing in their way, so
		// nothing above catches them. They take each other out.
		return moves.map((move) => ({
			...move,
			isFatal:
				move.isFatal ||
				moves.some(
					(otherMove) =>
						otherMove !== move &&
						isSamePosition(otherMove.nextHead, move.nextHead),
				),
		}));
	}

	private applyMoves(moves: SnakeMove[]) {
		for (const move of moves) {
			if (move.isFatal) {
				move.snake.kill();
				continue;
			}

			move.snake.move(move.nextHead, !!move.eatenFood);
			move.eatenFood?.respawnFood();
		}
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
		const otherSnakes = [...this.snakes.values()].filter(
			(otherSnake) => otherSnake !== snake,
		);

		return !snake.hasCollision(nextHead, false, otherSnakes);
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
