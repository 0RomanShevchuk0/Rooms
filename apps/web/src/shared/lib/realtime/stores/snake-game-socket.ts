import { SOCKET_NAMESPACES } from "../socket-namespaces";
import { createSocketStore } from "./createSocketStore";

export const useSnakeGameSocket = createSocketStore(SOCKET_NAMESPACES.SNAKE_GAME);
