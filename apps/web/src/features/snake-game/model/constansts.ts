import { SnakeDirectionEnum } from "@rooms/contracts/snake-game";

export const codeDirectionMap: Record<string, SnakeDirectionEnum> = {
	ArrowUp: SnakeDirectionEnum.UP,
	ArrowDown: SnakeDirectionEnum.DOWN,
	ArrowLeft: SnakeDirectionEnum.LEFT,
	ArrowRight: SnakeDirectionEnum.RIGHT,
	KeyW: SnakeDirectionEnum.UP,
	KeyS: SnakeDirectionEnum.DOWN,
	KeyA: SnakeDirectionEnum.LEFT,
	KeyD: SnakeDirectionEnum.RIGHT,
};
