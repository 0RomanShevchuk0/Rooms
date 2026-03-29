import type { DefaultEventsMap, Socket } from 'socket.io';
import { SocketWithAuth } from 'src/realtime/ws/api-socket-io.adapter';

export interface RoomsSocketData {
	roomId: string;
	participantId: string;
	sessionVersion: number;
}

export type RoomsSocket = Socket<
	DefaultEventsMap,
	DefaultEventsMap,
	DefaultEventsMap,
	Partial<RoomsSocketData>
>;

export type RoomsSocketWithAuth = RoomsSocket & SocketWithAuth;
