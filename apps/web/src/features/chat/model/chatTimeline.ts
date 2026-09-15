import type { ClientMessage } from "@/entities/message";
import { isSameDay } from "date-fns";

export type ChatTimelineItem =
	| { type: "message"; message: ClientMessage }
	| { type: "day"; key: string; date: Date };

/**
 * Takes messages newest-first, as the list renders them inside
 * `flex-col-reverse`, and returns items in that same DOM order. A day marker is
 * therefore emitted *after* the first message of its day, which the reversed
 * column then shows above it.
 */
export function toChatTimeline(messagesNewestFirst: ClientMessage[]): ChatTimelineItem[] {
	const items: ChatTimelineItem[] = [];

	messagesNewestFirst.forEach((message, index) => {
		const older = messagesNewestFirst[index + 1];
		const date = new Date(message.createdAt);

		items.push({ type: "message", message });

		if (!older || !isSameDay(date, new Date(older.createdAt))) {
			items.push({ type: "day", key: `day-${message.id}`, date });
		}
	});

	return items;
}
