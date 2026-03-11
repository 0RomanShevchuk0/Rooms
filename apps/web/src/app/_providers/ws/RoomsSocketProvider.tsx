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

const RoomsSocketContext = createContext<SocketContextValue | null>(null);

export function RoomsSocketProvider({ children }: PropsWithChildren) {
	const value = useSocketConnection(SOCKET_NAMESPACES.ROOMS);

	return <RoomsSocketContext.Provider value={value}>{children}</RoomsSocketContext.Provider>;
}

export function useRoomsSocket() {
	const ctx = useContext(RoomsSocketContext);
	if (!ctx) {
		throw new Error("useRoomsSocket must be used within RoomsSocketProvider");
	}
	return ctx;
}
