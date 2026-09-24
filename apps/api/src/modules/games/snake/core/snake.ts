import { directionPositions } from './constants';
import { directionOpposites, SnakeDirection } from './direction';
import { FieldSize, Position } from './types';

const MAX_QUEUED_TURNS = 2;

interface SnakeProps {
	fieldSize: FieldSize;
	color: string;
	initialDirection: SnakeDirection;
	initialSegments: Position[];
}

export class Snake {
	private readonly fieldSize: FieldSize;
	readonly color: string;
	segments: Position[];
	direction: SnakeDirection;
	alive = true;
	private queuedTurns: SnakeDirection[] = [];

	constructor({
		fieldSize,
		color,
		initialDirection,
		initialSegments,
	}: SnakeProps) {
		this.fieldSize = fieldSize;
		this.color = color;
		this.segments = initialSegments;
		this.direction = initialDirection;
	}

	kill() {
		this.alive = false;
	}

	/**
	 * Turns wait for the tick, so two quick presses cannot fold the snake
	 * back onto itself.
	 */
	changeDirection(newDirection: SnakeDirection) {
		this.queuedTurns.push(newDirection);
		if (this.queuedTurns.length > MAX_QUEUED_TURNS) {
			this.queuedTurns.shift();
		}
	}

	/**
	 * The latest press wins, which lets a misclick be taken back. When it
	 * cannot be taken yet, the earlier one goes first and the latest waits a
	 * tick, so a quick "right, down" still ends up heading down.
	 */
	applyQueuedTurn() {
		const latest = this.queuedTurns.at(-1);
		const earlier = this.queuedTurns.at(-2);

		if (latest && this.canTurnTo(latest)) {
			this.direction = latest;
			this.queuedTurns = [];
		} else if (earlier && this.canTurnTo(earlier)) {
			this.direction = earlier;
			this.queuedTurns.shift();
		} else {
			this.queuedTurns = [];
		}
	}

	move(position: Position, ateFood: boolean) {
		this.segments.unshift(position);
		if (!ateFood) {
			this.segments.pop();
		}
	}

	calculateNextPosition(): Position {
		const step = directionPositions[this.direction];
		const snakeHead = this.segments[0];
		const newPosition: Position = {
			x: snakeHead.x + step.x,
			y: snakeHead.y + step.y,
		};
		return newPosition;
	}

	/** `isGrowing` is what keeps the tail counted: a growing snake leaves it put. */
	hasCollision(
		position: Position,
		isGrowing: boolean,
		otherSnakes: Snake[],
	): boolean {
		const isFieldCollision = this.checkFieldCollision(position);
		const isSelfCollision = this.isSelfCollision(position, isGrowing);
		const isOtherSnakeCollision = otherSnakes.some((otherSnake) =>
			this.checkOtherSnakeCollision(position, otherSnake),
		);
		return isFieldCollision || isSelfCollision || isOtherSnakeCollision;
	}

	private canTurnTo(direction: SnakeDirection): boolean {
		return (
			direction !== this.direction &&
			directionOpposites[direction] !== this.direction
		);
	}

	private checkOtherSnakeCollision(
		position: Position,
		otherSnake: Snake,
	): boolean {
		if (!otherSnake.alive) return false;

		return otherSnake.segments.some(
			(segment) => segment.x === position.x && segment.y === position.y,
		);
	}

	private checkFieldCollision(nextHead: Position): boolean {
		const isBordersCollision =
			nextHead.x >= this.fieldSize.width ||
			nextHead.x < 0 ||
			nextHead.y >= this.fieldSize.height ||
			nextHead.y < 0;

		return isBordersCollision;
	}

	private isSelfCollision(position: Position, isGrowing: boolean): boolean {
		return this.segments.some(
			(segment, index) =>
				// The head cannot run into itself, and the tail cell is being
				// vacated this tick unless the snake is growing into it.
				index !== 0 &&
				(isGrowing || index !== this.segments.length - 1) &&
				segment.x === position.x &&
				segment.y === position.y,
		);
	}
}
