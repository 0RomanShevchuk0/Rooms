import { DirectionEnum, Position } from './types';

export const directionPositions: Record<DirectionEnum, Position> = {
	[DirectionEnum.UP]: { x: 0, y: -1 },
	[DirectionEnum.DOWN]: { x: 0, y: 1 },
	[DirectionEnum.LEFT]: { x: -1, y: 0 },
	[DirectionEnum.RIGHT]: { x: 1, y: 0 },
};
