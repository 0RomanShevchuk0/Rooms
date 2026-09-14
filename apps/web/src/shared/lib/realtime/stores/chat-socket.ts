import { SOCKET_NAMESPACES } from "../socket-namespaces";
import { createSocketStore } from "./createSocketStore";

export const useChatSocket = createSocketStore(SOCKET_NAMESPACES.CHAT);
