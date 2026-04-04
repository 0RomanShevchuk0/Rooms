import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { SendHorizonal } from "lucide-react";

interface ChatMessageFormProps {
	message: string;
	onMessageChange: (value: string) => void;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ChatMessageForm({
	message,
	onMessageChange,
	onSubmit,
}: ChatMessageFormProps) {
	return (
		<form className="flex gap-1" onSubmit={onSubmit}>
			<Input
				type="text"
				placeholder="Type your message here..."
				value={message}
				onChange={(e) => onMessageChange(e.target.value)}
			/>
			<Button type="submit">
				<SendHorizonal />
			</Button>
		</form>
	);
}
