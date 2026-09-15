import type { RoomParticipant } from "@rooms/contracts/room";
import type { SnakeGameState } from "@rooms/contracts/snake-game";

export interface SnakeMatchResult {
	participantId: string;
	name: string;
	color: string;
	length: number;
	alive: boolean;
	isOwn: boolean;
}

// The mock player is not a room participant, so it has no username to look up.
const UNKNOWN_PLAYER_NAME = "Bot";

/** Survivors first, then by length; the order the results are read in. */
export function toMatchResults(
	gameOverState: SnakeGameState,
	participants: RoomParticipant[],
	ownParticipantId: string | null,
): SnakeMatchResult[] {
	const nameById = new Map(participants.map((p) => [p.id, p.user.username]));

	return gameOverState.snakes
		.map((snake) => ({
			participantId: snake.participantId,
			name: nameById.get(snake.participantId) ?? UNKNOWN_PLAYER_NAME,
			color: snake.color,
			length: snake.segments.length,
			alive: snake.alive,
			isOwn: snake.participantId === ownParticipantId,
		}))
		.sort((a, b) => Number(b.alive) - Number(a.alive) || b.length - a.length);
}
