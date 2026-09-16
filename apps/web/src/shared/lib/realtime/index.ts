export { createSocket, type AppSocket } from "./createSocket";
export { SOCKET_NAMESPACES } from "./socket-namespaces";
export { SYSTEM_SOCKET_EVENTS } from "./socket-events";
export { useChatSocket, useRoomsSocket, useSnakeGameSocket } from "./stores";
export { configureSocketAuth, type SocketAuth } from "./socket-auth";
export {
	getWsErrorCode,
	getWsErrorMessage,
	getWsValidationIssues,
	isWsErrorResponse,
} from "./ws-errors";
