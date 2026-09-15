// Hues step around the wheel by the golden angle, so any number of players get
// spread-out colours without a list. The wheel is cut to 300° starting past red
// to keep every snake clear of the food.
const GOLDEN_ANGLE = 137.508;
const HUE_START = 30;
const HUE_RANGE = 300;

export function colorForSlot(slot: number): string {
	const hue = HUE_START + ((slot * GOLDEN_ANGLE) % HUE_RANGE);
	return `hsl(${hue.toFixed(1)} 70% 50%)`;
}

/** Grey on purpose: the mock is scenery, and should not pass for a player. */
export const MOCK_PLAYER_COLOR = 'hsl(0 0% 55%)';
