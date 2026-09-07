"use client";

import { Keyboard } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { KeyboardKey } from "@/shared/ui/keyboard-key";
import { useLocalToggle } from "@/shared/lib/useLocalToggle";

const CONTROLS_HINT_STORAGE_KEY = "rooms:snake-controls-hint";

const WASD_KEYS = ["W", "A", "S", "D"];
const ARROW_KEYS = ["↑", "←", "↓", "→"];

export function SnakeControlsHint() {
	const [isHintVisible, toggleHint] = useLocalToggle(CONTROLS_HINT_STORAGE_KEY, true);

	return (
		<div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
			{isHintVisible && (
				<>
					<span>Move</span>
					<span className="flex gap-1">
						{WASD_KEYS.map((key) => (
							<KeyboardKey key={key}>{key}</KeyboardKey>
						))}
					</span>
					<span>or</span>
					<span className="flex gap-1">
						{ARROW_KEYS.map((key) => (
							<KeyboardKey key={key}>{key}</KeyboardKey>
						))}
					</span>
				</>
			)}
			<Button
				variant="ghost"
				size="icon-xs"
				aria-pressed={isHintVisible}
				aria-label={isHintVisible ? "Hide the controls hint" : "Show the controls hint"}
				title={isHintVisible ? "Hide the controls hint" : "Show the controls hint"}
				onClick={toggleHint}
			>
				<Keyboard />
			</Button>
		</div>
	);
}
