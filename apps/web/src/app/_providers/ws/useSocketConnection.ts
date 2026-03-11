"use client";

import { useEffect, useMemo, useState } from "react";
import { createSocket, type AppSocket } from "@/shared/lib/realtime";

type UseSocketConnectionResult = {
	socket: AppSocket;
	connected: boolean;
};

export function useSocketConnection(namespace: string): UseSocketConnectionResult {
	const [socket] = useState(() => createSocket(namespace, { autoConnect: false }));
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

	return useMemo(() => ({ socket, connected }), [socket, connected]);
}
