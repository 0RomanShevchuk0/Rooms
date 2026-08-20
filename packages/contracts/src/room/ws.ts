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
	SET_READY: "room:set_ready",
	START_NOW: "room:start_now",
	LOBBY_STATE: "room:lobby_state",
} as const;

export const RoomPhaseEnum = {
	LOBBY: "lobby",
	GATHERING: "gathering",
	RUNNING: "running",
} as const;
export type RoomPhaseEnum = (typeof RoomPhaseEnum)[keyof typeof RoomPhaseEnum];

export const RoomPhaseSchema = z.enum([
	RoomPhaseEnum.LOBBY,
	RoomPhaseEnum.GATHERING,
	RoomPhaseEnum.RUNNING,
]);

export const RoomLobbyStatePayloadSchema = z.object({
	phase: RoomPhaseSchema,
	readyParticipantIds: z.array(RoomParticipantIdSchema),
	/** Counted down by the server; null outside the gathering window. */
	windowSecondsLeft: z.number().int().nullable(),
});

export const RoomSetReadyPayloadSchema = z.object({
	roomId: RoomIdSchema,
	isReady: z.boolean(),
});

export const RoomStartNowPayloadSchema = z.object({
	roomId: RoomIdSchema,
});

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
	userId: z.uuid(),
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
export type RoomPhase = z.infer<typeof RoomPhaseSchema>;
export type RoomLobbyStatePayload = z.infer<typeof RoomLobbyStatePayloadSchema>;
export type RoomSetReadyPayload = z.infer<typeof RoomSetReadyPayloadSchema>;
export type RoomStartNowPayload = z.infer<typeof RoomStartNowPayloadSchema>;
