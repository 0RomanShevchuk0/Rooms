import { getClientMessageStatus, type ClientMessage } from "@/entities/message";

import { format, isToday, isYesterday } from "date-fns";

interface MessageProps {
	message: ClientMessage;
}

export function Message({ message }: MessageProps) {
	const messageDate = message.createdAt ? new Date(message.createdAt) : new Date();
	const status = getClientMessageStatus(message);
	const isSending = status === "sending";
	const isFailed = status === "failed";

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
				{isSending ? <span className="text-xs">Sending...</span> : null}
				{isFailed ? <span className="text-xs text-destructive">Failed to send</span> : null}
			</div>

			<div className={isFailed ? "text-destructive" : undefined}>{message.content}</div>
		</div>
	);
}
