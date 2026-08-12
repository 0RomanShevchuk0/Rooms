import { chooseMockPlayerDirection } from './mock-player';
import { SNAKE_DIRECTION, type SnakeDirection } from './direction';

/** Feeds the rolls in order, so a "random" choice can be pinned down. */
function rolls(...values: number[]) {
	let index = 0;
	return () => values[index++] ?? 0;
}

const anythingGoes = () => true;

describe('chooseMockPlayerDirection', () => {
	it('carries straight on when the roll says so', () => {
		const direction = chooseMockPlayerDirection({
			currentDirection: SNAKE_DIRECTION.RIGHT,
			isSurvivable: anythingGoes,
			random: rolls(0.9),
		});

		expect(direction).toBe(SNAKE_DIRECTION.RIGHT);
	});

	it('turns when the roll comes up short', () => {
		const direction = chooseMockPlayerDirection({
			currentDirection: SNAKE_DIRECTION.RIGHT,
			isSurvivable: anythingGoes,
			random: rolls(0.05, 0),
		});

		expect(direction).not.toBe(SNAKE_DIRECTION.RIGHT);
	});

	// Without this it would walk into the wall it is already facing.
	it('turns away from a heading that kills it, roll or no roll', () => {
		const direction = chooseMockPlayerDirection({
			currentDirection: SNAKE_DIRECTION.RIGHT,
			isSurvivable: (candidate) => candidate === SNAKE_DIRECTION.UP,
			random: rolls(0.99),
		});

		expect(direction).toBe(SNAKE_DIRECTION.UP);
	});

	it('never picks a heading that kills it', () => {
		const deadly: SnakeDirection[] = [
			SNAKE_DIRECTION.UP,
			SNAKE_DIRECTION.LEFT,
		];
		const picked: SnakeDirection[] = [];

		for (let roll = 0; roll < 1; roll += 0.05) {
			picked.push(
				chooseMockPlayerDirection({
					currentDirection: SNAKE_DIRECTION.UP,
					isSurvivable: (candidate) => !deadly.includes(candidate),
					random: rolls(roll, roll),
				}),
			);
		}

		expect(picked.some((direction) => deadly.includes(direction))).toBe(
			false,
		);
	});

	it('holds its course when every way out is fatal', () => {
		const direction = chooseMockPlayerDirection({
			currentDirection: SNAKE_DIRECTION.DOWN,
			isSurvivable: () => false,
			random: rolls(0.5),
		});

		expect(direction).toBe(SNAKE_DIRECTION.DOWN);
	});
});
