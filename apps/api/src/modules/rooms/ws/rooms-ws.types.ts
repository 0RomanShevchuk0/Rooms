import type { Socket } from 'socket.io';
import type { PublicUser } from 'src/modules/users/users.select';

export interface RoomsSocketData {
	roomId: string;
	playerId: string;
	sessionVersion: number;
}

export type RoomsSocket = Socket<
	Record<string, never>,
	Record<string, never>,
	Record<string, never>,
	Partial<RoomsSocketData>
>;

export interface RoomParticipantPayload {
	roomId: string;
	playerId: string;
}

export type RoomConnectPayload = RoomParticipantPayload;
export interface RoomPresencePayload {
	playerId: string;
	onlinePlayerIds: string[];
}

export interface RoomPlayerJoinedPayload extends RoomPresencePayload {
	player: PublicUser;
}

export type RoomPlayerLeftPayload = RoomPresencePayload;
