import { create } from "zustand";
import { createSocket, type AppSocket } from "../createSocket";
import { SOCKET_NAMESPACES } from "../socket-namespaces";
import { useSession } from "@/entities/session";

type RoomsSocketState = {
	socket: AppSocket;
	connected: boolean;
	connect: () => void;
	disconnect: () => void;
};

export const useRoomsSocket = create<RoomsSocketState>((set, get) => {
	const socket = createSocket(SOCKET_NAMESPACES.ROOMS, { autoConnect: false });

	socket.on("connect", () => set({ connected: true }));
	socket.on("disconnect", () => set({ connected: false }));

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
