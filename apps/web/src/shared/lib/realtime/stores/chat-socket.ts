import { create } from "zustand";
import { createSocket, type AppSocket } from "../createSocket";
import { SOCKET_NAMESPACES } from "../socket-namespaces";

type ChatSocketState = {
	socket: AppSocket;
	connected: boolean;
	connect: () => void;
	disconnect: () => void;
};

export const useChatSocket = create<ChatSocketState>((set, get) => {
	const socket = createSocket(SOCKET_NAMESPACES.CHAT, { autoConnect: false });

	socket.on("connect", () => set({ connected: true }));
	socket.on("disconnect", () => set({ connected: false }));

	return {
		socket,
		connected: false,
		connect: () => {
			if (!get().socket.connected) {
				get().socket.connect();
			}
		},
		disconnect: () => {
			if (get().socket.connected) {
				get().socket.disconnect();
			}
		},
	};
});
