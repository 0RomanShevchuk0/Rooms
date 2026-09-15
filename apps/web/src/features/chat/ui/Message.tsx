import { getClientMessageStatus, type ClientMessage } from "@/entities/message";
import { cn } from "@/shared/lib/utils";
import { format } from "date-fns";

interface MessageProps {
	message: ClientMessage;
	isOwn: boolean;
}

export function Message({ message, isOwn }: MessageProps) {
	const status = getClientMessageStatus(message);

	return (
		<div
			className={cn(
				"flex gap-2 text-sm leading-6",
				status === "sending" && "opacity-60",
				status === "failed" && "text-destructive",
			)}
		>
			<span className="shrink-0 text-xs leading-6 text-muted-foreground tabular-nums">
				{format(new Date(message.createdAt), "HH:mm")}
			</span>
			<span className={cn("shrink-0 font-semibold", isOwn && "text-primary")}>
				{message.sender.username}
			</span>
			<span className="min-w-0 wrap-break-word whitespace-pre-wrap">
				{message.content}
				{status === "failed" && <span className="ml-2 text-xs">· failed to send</span>}
			</span>
		</div>
	);
}
