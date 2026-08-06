import type { DefaultEventsMap, Socket } from 'socket.io';
import { SocketWithAuth } from 'src/realtime/ws/api-socket-io.adapter';
import type { RoomPresenceContext } from '../presence/room-presence.service';

export type RoomsSocket = Socket<
	DefaultEventsMap,
	DefaultEventsMap,
	DefaultEventsMap,
	Partial<RoomPresenceContext>
>;

export type RoomsSocketWithAuth = RoomsSocket & SocketWithAuth;
