import type { RoomSnakeSettingsModel } from "../model/useRoomSnakeSettings";
import {
	SNAKE_FIELD_SIZE_PRESETS,
	SNAKE_FOOD_AMOUNT_PRESETS,
	parseFoodAmountPresetValue,
	parsePresetValue,
	toPresetValue,
} from "../model/constants";
import { SnakeSettingSelect } from "./SnakeSettingSelect";
import { SnakeSettingsCardFrame } from "./SnakeSettingsCardFrame";

interface SnakeSettingsCardsProps {
	model: RoomSnakeSettingsModel;
}

export function SnakeSettingsCards({ model }: SnakeSettingsCardsProps) {
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

	return (
		<div className="grid gap-3">
			<SnakeSettingsCardFrame
				title="Room settings"
				description={
					model.isGameInProgress
						? "Settings are locked while game is running."
						: "Changes apply to the next game start."
				}
			>
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
			</SnakeSettingsCardFrame>
		</div>
	);
}
