import { z } from "zod";
import { RoomIdSchema, RoomParticipantIdSchema } from "./model.js";

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

export type RoomConnectPayload = z.infer<typeof RoomConnectPayloadSchema>;
