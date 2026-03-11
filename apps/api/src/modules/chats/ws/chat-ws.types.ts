export type ChatRoomPayload = {
	chatId: string;
};

export type ChatConnectPayload = ChatRoomPayload;

export type ChatDisconnectPayload = ChatRoomPayload;

export type ChatMessagePayload = {
	chatId: string;
	senderId: string;
	content: string;
};
