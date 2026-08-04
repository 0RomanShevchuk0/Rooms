import { z } from "zod";
import {
	RoomIdSchema,
	RoomParticipantIdSchema,
} from "./base.js";
import { PublicUserSchema } from "../user/rest.js";

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

export const RoomPresencePayloadSchema = z.object({
	participantId: RoomParticipantIdSchema,
	onlineParticipantIds: z.array(RoomParticipantIdSchema),
});

export const RoomParticipantUserPayloadSchema = PublicUserSchema;

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
export type RoomPresencePayload = z.infer<typeof RoomPresencePayloadSchema>;
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
