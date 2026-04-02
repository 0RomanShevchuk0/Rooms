import { directionPositions } from './constants';
import { directionOpposites, SnakeDirection } from './direction';
import { Position } from './types';

interface SnakeProps {
	fieldSize: number;
	initialDirection: SnakeDirection;
	initialSegments: Position[];
}

export class Snake {
	private readonly fieldSize: number;
	public segments: Position[];
	public direction: SnakeDirection;

	constructor({ fieldSize, initialDirection, initialSegments }: SnakeProps) {
		this.fieldSize = fieldSize;
		this.segments = initialSegments;
		this.direction = initialDirection;
	}

	public changeDirection(newDirection: SnakeDirection) {
		if (directionOpposites[newDirection] === this.direction) {
			return;
		}
		this.direction = newDirection;
	}

	public move(position: Position, ateFood: boolean) {
		this.segments.unshift(position);
		if (!ateFood) {
			this.segments.pop();
		}
	}

	public calculateNextPosition(): Position {
		const step = directionPositions[this.direction];
		const snakeHead = this.segments[0];
		const newPosition: Position = {
			x: snakeHead.x + step.x,
			y: snakeHead.y + step.y,
		};
		return newPosition;
	}

	public hasCollision(position: Position, considerTail: boolean): boolean {
		const isFieldCollision = this.checkFieldCollision(position);
		const isSelfCollision = this.isSelfCollision(position, considerTail);
		return isFieldCollision || isSelfCollision;
	}

	private checkFieldCollision(nextHead: Position): boolean {
		const isBordersCollision =
			nextHead.x >= this.fieldSize ||
			nextHead.x < 0 ||
			nextHead.y >= this.fieldSize ||
			nextHead.y < 0;

		return isBordersCollision;
	}

	private isSelfCollision(position: Position, considerTail: boolean): boolean {
		return this.segments.some(
			(segment, index) =>
				index !== 0 &&
				(considerTail || index !== this.segments.length - 1) &&
				segment.x === position.x &&
				segment.y === position.y,
		);
	}
}
