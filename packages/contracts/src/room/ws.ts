import { z } from "zod";
import {
	RoomIdSchema,
	RoomParticipantIdSchema,
	RoomPresencePayloadSchema,
} from "./model.js";

export const ROOM_SOCKET_EVENTS = {
	CONNECT: "room:connect",
	DISCONNECT: "room:disconnect",
	PARTICIPANT_JOINED: "room:participant_joined",
	PARTICIPANT_LEFT: "room:participant_left",
} as const;

export const RoomConnectPayloadSchema = z.object({
	roomId: RoomIdSchema,
	participantId: RoomParticipantIdSchema,
});

export const RoomParticipantUserPayloadSchema = z.object({
	id: z.string().uuid(),
	username: z.string(),
	email: z.string().email().nullable(),
	name: z.string().nullable(),
	deletedAt: z.string().datetime().nullable(),
});

export const RoomParticipantPayloadSchema = z.object({
	id: RoomParticipantIdSchema,
	isReady: z.boolean(),
	userId: z.string().uuid(),
	user: RoomParticipantUserPayloadSchema,
});

export const RoomParticipantJoinedPayloadSchema =
	RoomPresencePayloadSchema.extend({
		participant: RoomParticipantPayloadSchema,
	});

export const RoomParticipantLeftPayloadSchema = RoomPresencePayloadSchema;

export type RoomConnectPayload = z.infer<typeof RoomConnectPayloadSchema>;
export type RoomParticipantUserPayload = z.infer<
	typeof RoomParticipantUserPayloadSchema
>;
export type RoomParticipantPayload = z.infer<
	typeof RoomParticipantPayloadSchema
>;
export type RoomParticipantJoinedPayload = z.infer<
	typeof RoomParticipantJoinedPayloadSchema
>;
export type RoomParticipantLeftPayload = z.infer<
	typeof RoomParticipantLeftPayloadSchema
>;
