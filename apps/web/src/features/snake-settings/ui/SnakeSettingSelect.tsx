import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

interface SnakeSettingSelectOption {
	value: string;
	label: string;
}

interface SnakeSettingSelectProps {
	label: string;
	value: string;
	placeholder: string;
	options: readonly SnakeSettingSelectOption[];
	disabled: boolean;
	onValueChange: (value: string) => void;
}

export function SnakeSettingSelect({
	label,
	value,
	placeholder,
	options,
	disabled,
	onValueChange,
}: SnakeSettingSelectProps) {
	return (
		<div className="grid gap-1.5">
			<p>{label}</p>
			<Select value={value} onValueChange={onValueChange} disabled={disabled}>
				<SelectTrigger className="w-full bg-muted/30">
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
