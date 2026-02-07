"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createEventsSocket, type EventsSocket } from "@/shared/lib/realtime";

type SocketContextValue = {
	socket: EventsSocket;
	connected: boolean;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: PropsWithChildren) {
	const [socket] = useState(() => createEventsSocket({ autoConnect: false }));
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		const handleConnect = () => setConnected(true);
		const handleDisconnect = () => setConnected(false);

		socket.on("connect", handleConnect);
		socket.on("disconnect", handleDisconnect);

		socket.connect();

		return () => {
			socket.off("connect", handleConnect);
			socket.off("disconnect", handleDisconnect);
			socket.disconnect();
		};
	}, [socket]);

	const value = useMemo(() => ({ socket, connected }), [socket, connected]);

	return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
	const ctx = useContext(SocketContext);
	if (!ctx) {
		throw new Error("useSocket must be used within SocketProvider");
	}
	return ctx;
}

