import type { MessageWithSender } from "@/entities/message";
import { getMessages } from "@/entities/message";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useQuery } from "@tanstack/react-query";
import { SendHorizonal } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";

interface ChatProps {
	chatId: string;
}

export function Chat({ chatId }: ChatProps) {
	const { data: messages } = useQuery({
		queryKey: ["chat", chatId],
		queryFn: () => getMessages({ chatId }),
	});

	const now = new Date();
	const todayDate = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
	const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
	const threeDaysAgoDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
	const twoWeeksAgoDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

	const mockMessages: MessageWithSender[] = [
		{
			id: "1",
			chatId,
			senderId: "1",
			content: "Hello, how are you?",
			sender: {
				id: "1",
				username: "test",
			},
			createdAt: twoWeeksAgoDate,
		},
		{
			id: "2",
			chatId,
			senderId: "2",
			content: "I'm good, thank you!",
			sender: {
				id: "36bd2fc8-a721-43f7-9c8f-bd36cd6fb891",
				username: "qwerty",
			},
			createdAt: threeDaysAgoDate,
		},
		{
			id: "3",
			chatId,
			senderId: "1",
			content: "What are you doing?",
			sender: {
				id: "1",
				username: "test",
			},
			createdAt: yesterdayDate,
		},
		{
			id: "4",
			chatId,
			senderId: "2",
			content: "I'm just working on a project.",
			sender: {
				id: "36bd2fc8-a721-43f7-9c8f-bd36cd6fb891",
				username: "qwerty",
			},
			createdAt: todayDate,
		},
	];

	const messagesToRender = messages?.items?.length ? messages.items : mockMessages;

	const Messages = messagesToRender.map((message) => {
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
			<div key={message.id} className={cn("mb-2")}>
				<div className="flex items-center gap-2 text-muted-foreground">
					<strong className="text-md">{message.sender.username}</strong>
					<span className="text-xs">{getFromattedDate()}</span>
				</div>

				{message.content}
			</div>
		);
	});

	return (
		<div className="h-full flex flex-col content-between gap-2">
			<div className="min-h-0 flex-1 rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground overflow-auto">
				{messagesToRender.length ? (
					<div className="flex flex-col gap-2">{Messages}</div>
				) : (
					<div className="w-full h-full flex items-center justify-center text-center text-sm text-muted-foreground">
						No messages yet
					</div>
				)}
			</div>
			<div className="flex gap-1">
				<Input type="text" placeholder="Type your message here..." />
				<Button type="submit">
					<SendHorizonal />
				</Button>
			</div>
		</div>
	);
}
