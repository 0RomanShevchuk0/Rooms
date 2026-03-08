import type { Socket } from 'socket.io';
import { RoomPartisipantWithUser } from '../partisipants/room-partisipants.select';

export interface RoomsSocketData {
	roomId: string;
	participantId: string;
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
	participantId: string;
}

export type RoomConnectPayload = RoomParticipantPayload;
export interface RoomPresencePayload {
	participantId: string;
	onlineParticipantIds: string[];
}

export interface RoomParticipantJoinedPayload extends RoomPresencePayload {
	participant: RoomPartisipantWithUser;
}

export type RoomParticipantLeftPayload = RoomPresencePayload;
