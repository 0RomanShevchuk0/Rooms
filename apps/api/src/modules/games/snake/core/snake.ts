import { directionPositions } from './constants';
import { directionOpposites, SnakeDirection } from './direction';
import { FieldSize, Position } from './types';

interface SnakeProps {
	fieldSize: FieldSize;
	initialDirection: SnakeDirection;
	initialSegments: Position[];
}

export class Snake {
	private readonly fieldSize: FieldSize;
	segments: Position[];
	direction: SnakeDirection;
	alive = true;

	constructor({ fieldSize, initialDirection, initialSegments }: SnakeProps) {
		this.fieldSize = fieldSize;
		this.segments = initialSegments;
		this.direction = initialDirection;
	}

	kill() {
		this.alive = false;
	}

	changeDirection(newDirection: SnakeDirection) {
		if (directionOpposites[newDirection] === this.direction) {
			return;
		}
		this.direction = newDirection;
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
