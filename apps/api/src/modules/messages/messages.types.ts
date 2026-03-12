import { Prisma } from 'generated/prisma/client';
import { publicUserSelect } from '../users/users.select';

export const messageWithSenderSelect = {
	id: true,
	content: true,
	chatId: true,
	senderId: true,
	createdAt: true,
	sender: {
		select: publicUserSelect,
	},
} satisfies Prisma.MessageSelect;

export type MessageWithSender = Prisma.MessageGetPayload<{
	select: typeof messageWithSenderSelect;
}>;

export interface PaginatedMessages {
	items: MessageWithSender[];
	nextCursor: string | null;
}
