import { Food } from './food';
import { Position } from './types';

interface FoodManagerProps {
	foodAmount: number;
	fieldSize: { width: number; height: number };
}

export class FoodManager {
	private food: Food[];

	constructor({ foodAmount, fieldSize }: FoodManagerProps) {
		this.food = Array.from(
			{ length: foodAmount },
			() => new Food({ fieldSize }),
		);
	}

	getFoodPositions() {
		return this.food.map((food) => food.getPosition());
	}

	findFoodByPosition(position: Position): Food | null {
		for (const food of this.food) {
			if (food.isFoodAt(position)) return food;
		}
		return null;
	}
}
