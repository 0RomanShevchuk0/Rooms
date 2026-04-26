import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import {
	parsePresetValue,
	SNAKE_FIELD_SIZE_PRESETS,
	type SnakeFieldSize,
	toPresetValue,
} from "../model/constants";

interface SnakeSettingsCardProps {
	snakeFieldSize: SnakeFieldSize;
	isGameInProgress: boolean;
	onSnakeFieldSizeChange: (fieldSize: SnakeFieldSize) => void;
}

export function SnakeSettingsCard({
	snakeFieldSize,
	isGameInProgress,
	onSnakeFieldSizeChange,
}: SnakeSettingsCardProps) {
	const handlePresetChange = (presetValue: string) => {
		const parsedFieldSize = parsePresetValue(presetValue);
		if (!parsedFieldSize) {
			return;
		}

		onSnakeFieldSizeChange(parsedFieldSize);
	};

	return (
		<Card className="border-border/60">
			<CardHeader className="space-y-3">
				<CardTitle>Room settings</CardTitle>
				<p className="text-xs text-muted-foreground">
					{isGameInProgress
						? "Settings are locked while game is running."
						: "Changes apply to the next game start."}
				</p>
			</CardHeader>
			<CardContent className="grid gap-3 text-xs text-muted-foreground">
				<div className="grid gap-1.5">
					<p>Grid preset</p>
					<Select
						value={toPresetValue(snakeFieldSize)}
						onValueChange={handlePresetChange}
						disabled={isGameInProgress}
					>
						<SelectTrigger className="w-full bg-muted/30">
							<SelectValue placeholder="Select preset" />
						</SelectTrigger>
						<SelectContent>
							{SNAKE_FIELD_SIZE_PRESETS.map((preset) => (
								<SelectItem
									key={toPresetValue(preset)}
									value={toPresetValue(preset)}
								>
									{preset.width}x{preset.height}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-2">
					Current: {snakeFieldSize.width}x{snakeFieldSize.height}
				</div>
			</CardContent>
		</Card>
	);
}
