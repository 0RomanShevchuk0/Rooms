import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { SnakeDirectionEnum, type SnakeDirection } from "@rooms/contracts/snake-game";
import { cn } from "@/shared/lib/utils";

interface SnakeTouchControlsProps {
	onDirection: (direction: SnakeDirection) => void;
	disabled: boolean;
}

const BUTTONS = [
	{
		direction: SnakeDirectionEnum.UP,
		label: "Up",
		Icon: ArrowUp,
		cell: "col-start-2 row-start-1",
	},
	{
		direction: SnakeDirectionEnum.LEFT,
		label: "Left",
		Icon: ArrowLeft,
		cell: "col-start-1 row-start-2",
	},
	{
		direction: SnakeDirectionEnum.RIGHT,
		label: "Right",
		Icon: ArrowRight,
		cell: "col-start-3 row-start-2",
	},
	{
		direction: SnakeDirectionEnum.DOWN,
		label: "Down",
		Icon: ArrowDown,
		cell: "col-start-2 row-start-3",
	},
];

export function SnakeTouchControls({ onDirection, disabled }: SnakeTouchControlsProps) {
	return (
		<div className="grid grid-cols-3 grid-rows-3 gap-1.5" aria-label="Snake controls">
			{BUTTONS.map(({ direction, label, Icon, cell }) => (
				<button
					key={direction}
					type="button"
					aria-label={label}
					disabled={disabled}
					// pointerdown, not click: a turn has to land within a tick, and
					// click on touch arrives late and can double up with the tap.
					onPointerDown={(event) => {
						event.preventDefault();
						onDirection(direction);
					}}
					className={cn(
						"flex size-14 touch-manipulation items-center justify-center rounded-xl border border-border bg-muted/50 text-foreground select-none active:bg-primary/15 disabled:opacity-40",
						cell,
					)}
				>
					<Icon className="size-6" />
				</button>
			))}
		</div>
	);
}
