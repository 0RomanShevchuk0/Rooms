"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";
import type { AppSocket } from "@/shared/lib/realtime";
import { SOCKET_NAMESPACES } from "@/shared/lib/realtime";
import { useSocketConnection } from "./useSocketConnection";

type SocketContextValue = {
	socket: AppSocket;
	connected: boolean;
};

const ChatSocketContext = createContext<SocketContextValue | null>(null);

export function ChatSocketProvider({ children }: PropsWithChildren) {
	const value = useSocketConnection(SOCKET_NAMESPACES.CHAT);

	return <ChatSocketContext.Provider value={value}>{children}</ChatSocketContext.Provider>;
}

export function useChatSocket() {
	const ctx = useContext(ChatSocketContext);
	if (!ctx) {
		throw new Error("useChatSocket must be used within ChatSocketProvider");
	}
	return ctx;
}
