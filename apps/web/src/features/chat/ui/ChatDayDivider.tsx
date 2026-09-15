import { format, isToday, isYesterday } from "date-fns";

interface ChatDayDividerProps {
	date: Date;
}

function formatDay(date: Date): string {
	if (isToday(date)) return "Today";
	if (isYesterday(date)) return "Yesterday";

	return format(date, "d MMMM yyyy");
}

export function ChatDayDivider({ date }: ChatDayDividerProps) {
	return (
		<div className="flex items-center gap-3 py-1 text-xs text-muted-foreground">
			<span className="h-px flex-1 bg-border/60" />
			<span>{formatDay(date)}</span>
			<span className="h-px flex-1 bg-border/60" />
		</div>
	);
}
