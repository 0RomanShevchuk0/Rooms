import type { MessageWithSender } from "@rooms/contracts/message";

export type ClientMessageStatus = "sending" | "failed" | "sent";

export interface ClientMessage extends MessageWithSender {
	clientStatus?: ClientMessageStatus;
}

export function getClientMessageStatus(message: ClientMessage): ClientMessageStatus {
	return message.clientStatus ?? "sent";
}
