import { SnakeGame } from './snake-game';
import { MOCK_PLAYER_ID, MOCK_PLAYER_SNAKE_LENGTH } from './mock-player';
import type { SnakeGameState } from './types';

const ALICE = 'participant-alice';
const SETTINGS = { fieldSize: { width: 20, height: 20 }, foodAmount: 1 };
const TICK_MS = 120;

function createGame(participantIds = [ALICE]) {
	const game = new SnakeGame({ participantIds, settings: SETTINGS });
	const states: SnakeGameState[] = [];
	let gameOverState: SnakeGameState | null = null;

	// The state carries live segment arrays, so a recorded state would keep
	// changing underneath us.
	game.on('tick', (state) => states.push(structuredClone(state)));
	game.on('gameOver', (state) => {
		gameOverState = structuredClone(state);
	});
	game.startGame();

	return {
		game,
		states,
		lastState: () => states[states.length - 1],
		getGameOverState: (): SnakeGameState | null => gameOverState,
	};
}

function snakeOf(state: SnakeGameState, participantId: string) {
	return state.snakes.find((snake) => snake.participantId === participantId);
}

describe('SnakeGame with the mock player', () => {
	beforeEach(() => {
		jest.useFakeTimers();
		process.env.SNAKE_TICK_MS = String(TICK_MS);
	});

	afterEach(() => {
		jest.useRealTimers();
		delete process.env.SNAKE_MOCK_PLAYER;
	});

	it('sits in every game as a second snake', () => {
		const { game, lastState } = createGame();
		jest.advanceTimersByTime(TICK_MS);

		expect(lastState().snakes.map((snake) => snake.participantId)).toEqual([
			ALICE,
			MOCK_PLAYER_ID,
		]);
		game.destroy();
	});

	it('stays out when switched off', () => {
		process.env.SNAKE_MOCK_PLAYER = 'false';

		const { game, lastState } = createGame();
		jest.advanceTimersByTime(TICK_MS);

		expect(lastState().snakes.map((snake) => snake.participantId)).toEqual([
			ALICE,
		]);
		game.destroy();
	});

	it('starts out at full length instead of growing into one', () => {
		const { game, lastState } = createGame();
		jest.advanceTimersByTime(TICK_MS);

		expect(snakeOf(lastState(), MOCK_PLAYER_ID)?.segments).toHaveLength(
			MOCK_PLAYER_SNAKE_LENGTH,
		);
		expect(snakeOf(lastState(), ALICE)?.segments).toHaveLength(1);
		game.destroy();
	});

	// A wanderer with no wall sense would be dead within a few ticks in here.
	it('keeps itself alive on a field with barely any room', () => {
		const game = new SnakeGame({
			participantIds: [ALICE],
			settings: { fieldSize: { width: 8, height: 8 }, foodAmount: 1 },
		});
		const states: SnakeGameState[] = [];
		game.on('tick', (state) => states.push(structuredClone(state)));
		game.startGame();

		jest.advanceTimersByTime(TICK_MS * 6);

		const lastState = states[states.length - 1];
		expect(snakeOf(lastState, MOCK_PLAYER_ID)?.alive).toBe(true);
		game.destroy();
	});

	it('moves on its own without anyone sending directions', () => {
		const { game, states, lastState } = createGame();
		jest.advanceTimersByTime(TICK_MS * 5);

		const firstHead = snakeOf(states[0], MOCK_PLAYER_ID)?.segments[0];
		const lastHead = snakeOf(lastState(), MOCK_PLAYER_ID)?.segments[0];

		expect(lastHead).not.toEqual(firstHead);
		game.destroy();
	});

	it('wanders instead of driving into a wall', () => {
		const { game, lastState } = createGame();
		jest.advanceTimersByTime(TICK_MS * 40);

		expect(snakeOf(lastState(), MOCK_PLAYER_ID)?.alive).toBe(true);
		game.destroy();
	});

	// Otherwise an immortal bot would keep the room in the running phase forever.
	it('does not keep the match alive once the players are gone', () => {
		const { getGameOverState } = createGame();

		// Alice never turns, so she runs into the top wall on her own.
		jest.advanceTimersByTime(TICK_MS * 40);

		const finalState = getGameOverState();
		expect(finalState).not.toBeNull();
		expect(snakeOf(finalState!, ALICE)?.alive).toBe(false);
		expect(snakeOf(finalState!, MOCK_PLAYER_ID)?.alive).toBe(true);
	});
});
