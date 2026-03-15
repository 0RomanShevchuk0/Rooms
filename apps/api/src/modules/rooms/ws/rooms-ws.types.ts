import type { Socket } from 'socket.io';
import { RoomParticipantWithUser } from '../participants/room-participants.select';

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
	participant: RoomParticipantWithUser;
}

export type RoomParticipantLeftPayload = RoomPresencePayload;
