import { chooseMockPlayerDirection } from './mock-player';
import { SNAKE_DIRECTION, type SnakeDirection } from './direction';

/**
 * The odds of turning are nobody's business; what matters is that a roll can
 * never send the snake somewhere fatal. Every case here holds for any roll.
 */
describe('chooseMockPlayerDirection', () => {
	it('turns away from a heading that kills it', () => {
		const direction = chooseMockPlayerDirection({
			currentDirection: SNAKE_DIRECTION.RIGHT,
			isSurvivable: (candidate) => candidate === SNAKE_DIRECTION.UP,
		});

		expect(direction).toBe(SNAKE_DIRECTION.UP);
	});

	it('never picks a heading that kills it', () => {
		const deadly: SnakeDirection[] = [
			SNAKE_DIRECTION.UP,
			SNAKE_DIRECTION.LEFT,
		];

		const picked = Array.from({ length: 50 }, () =>
			chooseMockPlayerDirection({
				currentDirection: SNAKE_DIRECTION.UP,
				isSurvivable: (candidate) => !deadly.includes(candidate),
			}),
		);

		expect(picked.some((direction) => deadly.includes(direction))).toBe(
			false,
		);
	});

	it('holds its course when every way out is fatal', () => {
		const direction = chooseMockPlayerDirection({
			currentDirection: SNAKE_DIRECTION.DOWN,
			isSurvivable: () => false,
		});

		expect(direction).toBe(SNAKE_DIRECTION.DOWN);
	});

	it('stays on the board of survivable headings', () => {
		const survivable: SnakeDirection[] = [
			SNAKE_DIRECTION.LEFT,
			SNAKE_DIRECTION.RIGHT,
		];

		const picked = Array.from({ length: 50 }, () =>
			chooseMockPlayerDirection({
				currentDirection: SNAKE_DIRECTION.UP,
				isSurvivable: (candidate) => survivable.includes(candidate),
			}),
		);

		expect(picked.every((direction) => survivable.includes(direction))).toBe(
			true,
		);
	});
});
