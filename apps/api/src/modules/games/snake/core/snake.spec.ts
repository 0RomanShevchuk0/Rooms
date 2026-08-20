import { Snake } from './snake';
import { SNAKE_DIRECTION, type SnakeDirection } from './direction';
import type { Position } from './types';

const FIELD_SIZE = { width: 20, height: 20 };

function createSnake(
	segments: Position[],
	direction: SnakeDirection = SNAKE_DIRECTION.RIGHT,
) {
	return new Snake({
		fieldSize: FIELD_SIZE,
		initialDirection: direction,
		initialSegments: segments,
	});
}

describe('Snake collisions', () => {
	describe('with itself', () => {
		// Head at (5,5), body trailing right, tail at (8,5).
		const createCurledSnake = () =>
			createSnake([
				{ x: 5, y: 5 },
				{ x: 6, y: 5 },
				{ x: 7, y: 5 },
				{ x: 8, y: 5 },
			]);

		it('counts its own body', () => {
			expect(
				createCurledSnake().hasCollision({ x: 6, y: 5 }, false, []),
			).toBe(true);
		});

		// The tail steps away on the same tick, so the cell is free by then.
		it('lets it follow its own tail', () => {
			expect(
				createCurledSnake().hasCollision({ x: 8, y: 5 }, false, []),
			).toBe(false);
		});

		it('counts the tail while it is growing into it', () => {
			expect(
				createCurledSnake().hasCollision({ x: 8, y: 5 }, true, []),
			).toBe(true);
		});
	});

	describe('with another snake', () => {
		const alice = () => createSnake([{ x: 5, y: 5 }]);
		const bob = () =>
			createSnake(
				[
					{ x: 6, y: 5 },
					{ x: 7, y: 5 },
					{ x: 8, y: 5 },
				],
				SNAKE_DIRECTION.LEFT,
			);

		// Head-on used to pass straight through.
		it('counts their head', () => {
			expect(alice().hasCollision({ x: 6, y: 5 }, false, [bob()])).toBe(
				true,
			);
		});

		it('counts their body', () => {
			expect(alice().hasCollision({ x: 7, y: 5 }, false, [bob()])).toBe(
				true,
			);
		});

		// Their tail may or may not move; from here there is no way to know.
		it('counts their tail whatever this snake is doing', () => {
			expect(alice().hasCollision({ x: 8, y: 5 }, false, [bob()])).toBe(
				true,
			);
			expect(alice().hasCollision({ x: 8, y: 5 }, true, [bob()])).toBe(true);
		});

		it('drives through the dead', () => {
			const deadBob = bob();
			deadBob.kill();

			expect(alice().hasCollision({ x: 7, y: 5 }, false, [deadBob])).toBe(
				false,
			);
		});

		it('leaves empty cells alone', () => {
			expect(alice().hasCollision({ x: 5, y: 6 }, false, [bob()])).toBe(
				false,
			);
		});
	});

	describe('with the field', () => {
		it('counts every wall', () => {
			const snake = createSnake([{ x: 0, y: 0 }]);

			expect(snake.hasCollision({ x: -1, y: 0 }, false, [])).toBe(true);
			expect(snake.hasCollision({ x: 0, y: -1 }, false, [])).toBe(true);
			expect(
				snake.hasCollision({ x: FIELD_SIZE.width, y: 0 }, false, []),
			).toBe(true);
			expect(
				snake.hasCollision({ x: 0, y: FIELD_SIZE.height }, false, []),
			).toBe(true);
		});
	});
});
