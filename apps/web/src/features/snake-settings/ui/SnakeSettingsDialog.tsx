"use client";

import { Settings } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/ui/dialog";
import type { RoomSnakeSettingsModel } from "../model/useRoomSnakeSettings";
import {
	SNAKE_FIELD_SIZE_PRESETS,
	SNAKE_FOOD_AMOUNT_PRESETS,
	SNAKE_SPEED_PRESETS,
	parseFoodAmountPresetValue,
	parsePresetValue,
	parseSpeedPresetValue,
	toPresetValue,
} from "../model/constants";
import { SnakeSettingSelect } from "./SnakeSettingSelect";

interface SnakeSettingsDialogProps {
	model: RoomSnakeSettingsModel;
}

export function SnakeSettingsDialog({ model }: SnakeSettingsDialogProps) {
	const handleFieldSizeChange = (presetValue: string) => {
		const parsedFieldSize = parsePresetValue(presetValue);
		if (!parsedFieldSize) {
			return;
		}

		model.actions.setFieldSize(parsedFieldSize);
	};

	const handleFoodAmountChange = (presetValue: string) => {
		const parsedFoodAmount = parseFoodAmountPresetValue(presetValue);
		if (!parsedFoodAmount) {
			return;
		}

		model.actions.setFoodAmount(parsedFoodAmount);
	};

	const handleSpeedChange = (presetValue: string) => {
		const parsedSpeed = parseSpeedPresetValue(presetValue);
		if (!parsedSpeed) {
			return;
		}

		model.actions.setSpeed(parsedSpeed);
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="Game settings"
					className="text-muted-foreground"
				>
					<Settings />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Game settings</DialogTitle>
					<DialogDescription>
						{model.isGameInProgress
							? "Settings are locked while the game is running."
							: "Changes apply to the next game. Everyone in the room sees them."}
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4">
					<SnakeSettingSelect
						label="Grid preset"
						value={toPresetValue(model.snakeSettings.fieldSize)}
						placeholder="Select preset"
						disabled={model.isGameInProgress}
						onValueChange={handleFieldSizeChange}
						options={SNAKE_FIELD_SIZE_PRESETS.map((preset) => ({
							value: toPresetValue(preset),
							label: `${preset.width}x${preset.height}`,
						}))}
					/>

					<SnakeSettingSelect
						label="Food pieces on map"
						value={String(model.snakeSettings.foodAmount)}
						placeholder="Select amount"
						disabled={model.isGameInProgress}
						onValueChange={handleFoodAmountChange}
						options={SNAKE_FOOD_AMOUNT_PRESETS.map((preset) => ({
							value: String(preset),
							label: String(preset),
						}))}
					/>

					<SnakeSettingSelect
						label="Speed"
						value={String(model.snakeSettings.speed)}
						placeholder="Select speed"
						disabled={model.isGameInProgress}
						onValueChange={handleSpeedChange}
						options={SNAKE_SPEED_PRESETS.map((preset) => ({
							value: String(preset),
							label: String(preset),
						}))}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
