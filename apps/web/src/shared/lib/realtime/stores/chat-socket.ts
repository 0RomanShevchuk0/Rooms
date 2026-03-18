import { create } from "zustand";
import { createSocket, type AppSocket } from "../createSocket";
import { SOCKET_NAMESPACES } from "../socket-namespaces";
import { useSession } from "@/entities/session";

type ChatSocketState = {
	socket: AppSocket;
	connected: boolean;
	connect: () => void;
	disconnect: () => void;
};

export const useChatSocket = create<ChatSocketState>((set, get) => {
	const socket = createSocket(SOCKET_NAMESPACES.CHAT, {
		autoConnect: false,
	});

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
