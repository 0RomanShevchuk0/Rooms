import { DirectionEnum } from "./types";

export const directionInputMap: Record<string, DirectionEnum> = {
	ArrowUp: DirectionEnum.UP,
	ArrowDown: DirectionEnum.DOWN,
	ArrowLeft: DirectionEnum.LEFT,
	ArrowRight: DirectionEnum.RIGHT,
	w: DirectionEnum.UP,
	s: DirectionEnum.DOWN,
	a: DirectionEnum.LEFT,
	d: DirectionEnum.RIGHT,
};
