import { MessageWithSender } from "@/entities/message";

import { format, isToday, isYesterday } from "date-fns";

interface MessageProps {
	message: MessageWithSender;
}

export function Message({ message }: MessageProps) {
	const messageDate = message.createdAt ? new Date(message.createdAt) : new Date();

	const getFromattedDate = () => {
		if (isToday(messageDate)) {
			return format(messageDate, "HH:mm");
		}
		if (isYesterday(messageDate)) {
			return `Yesterday, at ${format(messageDate, "HH:mm")}`;
		}
		return format(messageDate, "dd.MM.yyyy HH:mm");
	};

	return (
		<div className="mb-2">
			<div className="flex items-center gap-2 text-muted-foreground">
				<strong className="text-md">{message.sender.username}</strong>
				<span className="text-xs">{getFromattedDate()}</span>
			</div>

			{message.content}
		</div>
	);
}
