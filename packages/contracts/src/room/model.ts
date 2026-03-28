import { z } from "zod";

export const RoomIdSchema = z.string().uuid();
export const RoomParticipantIdSchema = z.string().uuid();

export const RoomPresencePayloadSchema = z.object({
	participantId: RoomParticipantIdSchema,
	onlineParticipantIds: z.array(RoomParticipantIdSchema),
});

export type RoomId = z.infer<typeof RoomIdSchema>;
export type RoomParticipantId = z.infer<typeof RoomParticipantIdSchema>;
export type RoomPresencePayload = z.infer<typeof RoomPresencePayloadSchema>;
