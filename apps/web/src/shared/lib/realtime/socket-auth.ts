// The stores live in shared and must not know where the session is kept; the
// session layer plugs itself in here at startup, the same way it does for `api`.
export interface SocketAuth {
	getToken: () => string | null;
	subscribe: (listener: (token: string | null) => void) => void;
	onUnauthorized: () => void;
}

let socketAuth: SocketAuth | null = null;

export function configureSocketAuth(auth: SocketAuth) {
	socketAuth = auth;
}

export function getSocketAuth(): SocketAuth {
	if (!socketAuth) throw new Error("Socket auth is not configured");
	return socketAuth;
}
