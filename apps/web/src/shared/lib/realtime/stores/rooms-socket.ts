import { create } from "zustand";
import { createSocket, type AppSocket } from "../createSocket";
import { SOCKET_NAMESPACES } from "../socket-namespaces";
import { SYSTEM_SOCKET_EVENTS } from "../socket-events";
import { useSession } from "@/entities/session";

type RoomsSocketState = {
	socket: AppSocket;
	connected: boolean;
	connect: () => void;
	disconnect: () => void;
};

export const useRoomsSocket = create<RoomsSocketState>((set, get) => {
	const socket = createSocket(SOCKET_NAMESPACES.ROOMS, { autoConnect: false });

	socket.on(SYSTEM_SOCKET_EVENTS.CONNECT, () => set({ connected: true }));
	socket.on(SYSTEM_SOCKET_EVENTS.DISCONNECT, () => set({ connected: false }));
	socket.on(SYSTEM_SOCKET_EVENTS.CONNECT_ERROR, (err: Error) => {
		if (err.message === "Unauthorized") {
			useSession.getState().clearSession();
		}
	});

	return {
		socket,
		connected: false,
		connect: () => {
			const { accessToken } = useSession.getState();
			const s = get().socket;

			if (!s.connected) {
				s.auth = { token: accessToken };
				s.connect();
			}
		},
		disconnect: () => {
			if (get().socket.connected) {
				get().socket.disconnect();
			}
		},
	};
});
