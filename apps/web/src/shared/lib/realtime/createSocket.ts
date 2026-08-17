import { io, type ManagerOptions, type Socket, type SocketOptions } from "socket.io-client";

const SOCKET_IO_PATH = "/api/socket.io";

export type AppSocket = Socket;

export function createSocket(
	namespace: string,
	options: Partial<ManagerOptions & SocketOptions> = {},
): AppSocket {
	const apiUrl = process.env.NEXT_PUBLIC_SOCKET_IO_URL ?? "http://localhost:4000/api";
	// Same-origin deployments pass "/api", which must collapse to an empty
	// origin so socket.io connects to the current host on namespace "/chat"
	// rather than "/api/chat".
	const origin = apiUrl.replace(/\/api\/?$/, "");
	return io(`${origin}/${namespace}`, {
		path: SOCKET_IO_PATH,
		transports: ["websocket"],
		...options,
	});
}
