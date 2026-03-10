import type { MessageWithSender } from "@/entities/message";
import { getMessages } from "@/entities/message";
import { useMeQuery } from "@/entities/user/model/useMeQuery";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useQuery } from "@tanstack/react-query";
import { SendHorizonal } from "lucide-react";

interface ChatProps {
	chatId: string;
}

export function Chat({ chatId }: ChatProps) {
	const { user } = useMeQuery();
	console.log("🚀 ~ Chat ~ user:", user);
	const { data: messages } = useQuery({
		queryKey: ["chat", chatId],
		queryFn: () => getMessages({ chatId }),
	});

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
		},
	];

	const messagesToRender = messages?.items?.length ? messages.items : mockMessages;

	const Messages = messagesToRender.map((message) => {
		return (
			<div key={message.id} className={cn("mb-2")}>
				<div>
					<strong>{message.sender.username}</strong>
				</div>
				{message.content}
			</div>
		);
	});

	return (
		<div className="h-full flex flex-col content-between gap-2">
			<div className="min-h-0 flex-1 rounded-lg border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
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
