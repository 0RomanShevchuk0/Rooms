import { SnakeDirectionEnum } from "@/entities/snake-game";

export const directionInputMap: Record<string, SnakeDirectionEnum> = {
	ArrowUp: SnakeDirectionEnum.UP,
	ArrowDown: SnakeDirectionEnum.DOWN,
	ArrowLeft: SnakeDirectionEnum.LEFT,
	ArrowRight: SnakeDirectionEnum.RIGHT,
	w: SnakeDirectionEnum.UP,
	s: SnakeDirectionEnum.DOWN,
	a: SnakeDirectionEnum.LEFT,
	d: SnakeDirectionEnum.RIGHT,
};
