import { io, type ManagerOptions, type Socket, type SocketOptions } from "socket.io-client";

const SOCKET_IO_PATH = "/api/socket.io";

export type AppSocket = Socket;

export function createSocket(namespace: string, options: Partial<ManagerOptions & SocketOptions> = {}): AppSocket {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
	const origin = apiUrl.replace(/\/api\/?$/, "") || apiUrl;
	return io(`${origin}/${namespace}`, {
		path: SOCKET_IO_PATH,
		transports: ["websocket"],
		...options,
	});
}

// for ngrok
// export function createSocket(namespace: string, options: Partial<ManagerOptions & SocketOptions> = {}): AppSocket {
// 	// const apiUrl = "/api";

// 	const normalizedNamespace = namespace.startsWith("/") ? namespace : `/${namespace}`;
// 	const origin = apiUrl.startsWith("http") ? apiUrl.replace(/\/api\/?$/, "") : window.location.origin;

// 	return io(`${origin}${normalizedNamespace}`, {
// 		path: SOCKET_IO_PATH,
// 		transports: ["polling", "websocket"],
// 		...options,
// 	});
// }
