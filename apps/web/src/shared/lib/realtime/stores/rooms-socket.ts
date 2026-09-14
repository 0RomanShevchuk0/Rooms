import { SOCKET_NAMESPACES } from "../socket-namespaces";
import { createSocketStore } from "./createSocketStore";

export const useRoomsSocket = createSocketStore(SOCKET_NAMESPACES.ROOMS);
