import { io, type ManagerOptions, type Socket, type SocketOptions } from "socket.io-client";

export type EventsSocket = Socket;

const SOCKET_IO_PATH = "/api/socket.io";

export function createEventsSocket(
	options: Partial<ManagerOptions & SocketOptions> = {},
): EventsSocket {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
	const origin = apiUrl.replace(/\/api\/?$/, "") || apiUrl;
	return io(`${origin}/events`, {
		path: SOCKET_IO_PATH,
		transports: ["websocket"],
		...options,
	});
}

