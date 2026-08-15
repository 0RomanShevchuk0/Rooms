import { SNAKE_DIRECTION, type SnakeDirection } from './direction';
import type { FieldSize, Position } from './types';

/**
 * A stand-in second player, so multiplayer can be looked at without a second
 * browser. It is not a room participant: it never shows up in the lobby and it
 * cannot keep a match alive on its own.
 */
export const MOCK_PLAYER_ID = 'mock-player';

export const MOCK_PLAYER_SNAKE_LENGTH = 6;

export const MOCK_PLAYER_INITIAL_DIRECTION = SNAKE_DIRECTION.RIGHT;

/** Odds of looking for a turn on a tick where carrying straight on is fine. */
const TURN_CHANCE = 0.2;

const ALL_DIRECTIONS = Object.values(SNAKE_DIRECTION);

export function isMockPlayerEnabled(): boolean {
	return process.env.SNAKE_MOCK_PLAYER !== 'false';
}

interface ChooseMockPlayerDirectionProps {
	currentDirection: SnakeDirection;
	/** Whether heading that way survives the next tick — walls, tail and all. */
	isSurvivable: (direction: SnakeDirection) => boolean;
}

/**
 * Wanders instead of following a route: mostly carries straight on, now and
 * then picks a new heading, and only ever considers headings that do not kill
 * it. With nowhere safe to go it holds its course and takes the hit.
 */
export function chooseMockPlayerDirection({
	currentDirection,
	isSurvivable,
}: ChooseMockPlayerDirectionProps): SnakeDirection {
	const survivable = ALL_DIRECTIONS.filter(isSurvivable);
	if (survivable.length === 0) {
		return currentDirection;
	}

	const canCarryOn = survivable.includes(currentDirection);
	if (canCarryOn && Math.random() >= TURN_CHANCE) {
		return currentDirection;
	}

	const turns = survivable.filter(
		(direction) => direction !== currentDirection,
	);
	const options = turns.length > 0 ? turns : survivable;

	return options[Math.floor(Math.random() * options.length)];
}

/**
 * Head first, body trailing behind it, so the snake starts out full length
 * instead of growing into one. Shortened on a field too narrow to hold it.
 */
export function createMockPlayerSegments(
	fieldSize: FieldSize,
	row: number,
): Position[] {
	const headX = Math.floor(fieldSize.width / 2);
	const length = Math.max(1, Math.min(MOCK_PLAYER_SNAKE_LENGTH, headX + 1));

	return Array.from({ length }, (_, index) => ({ x: headX - index, y: row }));
}
