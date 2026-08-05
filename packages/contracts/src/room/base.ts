import { z } from "zod";

export const RoomIdSchema = z.uuid();
export const RoomParticipantIdSchema = z.uuid();

export type RoomId = z.infer<typeof RoomIdSchema>;
export type RoomParticipantId = z.infer<typeof RoomParticipantIdSchema>;
