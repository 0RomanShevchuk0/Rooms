"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createSocket, type AppSocket, SOCKET_NAMESPACES } from "@/shared/lib/realtime";

type SocketContextValue = {
	socket: AppSocket;
	connected: boolean;
};

const RoomsSocketContext = createContext<SocketContextValue | null>(null);

export function RoomsSocketProvider({ children }: PropsWithChildren) {
	const [socket] = useState(() => createSocket(SOCKET_NAMESPACES.ROOMS, { autoConnect: false }));
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
			if (socket.connected) {
				socket.disconnect();
			}
		};
	}, [socket]);

	const value = useMemo(() => ({ socket, connected }), [socket, connected]);

	return <RoomsSocketContext.Provider value={value}>{children}</RoomsSocketContext.Provider>;
}

export function useRoomsSocket() {
	const ctx = useContext(RoomsSocketContext);
	if (!ctx) {
		throw new Error("useRoomsSocket must be used within RoomsSocketProvider");
	}
	return ctx;
}
