import { Position } from './types';

export class Food {
	private readonly fieldSize: number;
	private position: Position;

	constructor({ fieldSize }: { fieldSize: number }) {
		this.fieldSize = fieldSize;
		this.respawnFood();
	}

	public getPosition(): Position {
		return { ...this.position };
	}

	public isFoodAt(position: Position): boolean {
		return this.position.x === position.x && this.position.y === position.y;
	}

	public respawnFood() {
		const position: Position = this.generateFoodPosition();
		this.position = position;
	}

	private generateFoodPosition(): Position {
		return {
			x: Math.floor(Math.random() * this.fieldSize),
			y: Math.floor(Math.random() * this.fieldSize),
		};
	}
}
