import { io, type ManagerOptions, type Socket, type SocketOptions } from "socket.io-client";

export type EventsSocket = Socket;

export function createEventsSocket(
	options: Partial<ManagerOptions & SocketOptions> = {},
): EventsSocket {
	const baseUrl = process.env.NEXT_PUBLIC_API_URL;
	return io(`${baseUrl}/events`, {
		transports: ["websocket"],
		...options,
	});
}

