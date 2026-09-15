import { create } from "zustand";
import toast from "react-hot-toast";
import { api } from "@/shared/api";
import { useSession } from "@/entities/session";
import { createSocket, type AppSocket } from "../createSocket";
import { SYSTEM_SOCKET_EVENTS } from "../socket-events";
import { getWsErrorCode, getWsErrorMessage } from "../ws-errors";

export interface SocketStoreState {
	socket: AppSocket;
	/** Dropped without being asked to and trying to get back. */
	isReconnecting: boolean;
	connect: () => void;
	disconnect: () => void;
}

const MANUAL_DISCONNECT_REASON = "io client disconnect";

const UNAUTHORIZED_MESSAGE = "Unauthorized";
const UNAUTHORIZED_CODE = "UNAUTHORIZED";

export function createSocketStore(namespace: string) {
	return create<SocketStoreState>((set, get) => {
		const socket = createSocket(namespace, { autoConnect: false });

		const setAuthToken = (token: string | null) => {
			socket.auth = { token };
		};

		useSession.subscribe((state, previous) => {
			if (state.accessToken !== previous.accessToken) {
				setAuthToken(state.accessToken);
			}
		});

		let hasRetriedWithFreshToken = false;

		const recoverFromUnauthorized = async () => {
			if (hasRetriedWithFreshToken) {
				useSession.getState().clearSession();
				return;
			}
			hasRetriedWithFreshToken = true;

			// Our own disconnect, but from the user's side this is still an outage.
			socket.disconnect();
			set({ isReconnecting: true });

			const token = await api.refreshAccessToken();
			if (!token) {
				useSession.getState().clearSession();
				return;
			}

			setAuthToken(token);
			socket.connect();
		};

		socket.on(SYSTEM_SOCKET_EVENTS.CONNECT, () => {
			hasRetriedWithFreshToken = false;
			set({ isReconnecting: false });
		});
		socket.on(SYSTEM_SOCKET_EVENTS.DISCONNECT, (reason: string) => {
			set({ isReconnecting: reason !== MANUAL_DISCONNECT_REASON });
		});
		socket.on(SYSTEM_SOCKET_EVENTS.CONNECT_ERROR, (error: Error) => {
			if (error.message === UNAUTHORIZED_MESSAGE) {
				void recoverFromUnauthorized();
			}
		});
		socket.on(SYSTEM_SOCKET_EVENTS.EXCEPTION, (payload: unknown) => {
			if (getWsErrorCode(payload) === UNAUTHORIZED_CODE) {
				void recoverFromUnauthorized();
				return;
			}

			toast.error(`Error: ${getWsErrorMessage(payload)}`);
		});

		return {
			socket,
			isReconnecting: false,
			connect: () => {
				const current = get().socket;
				if (current.connected) return;

				setAuthToken(useSession.getState().accessToken);
				current.connect();
			},
			disconnect: () => {
				const current = get().socket;
				if (current.connected) current.disconnect();
			},
		};
	});
}
