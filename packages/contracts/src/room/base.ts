import { z } from "zod";

export const RoomIdSchema = z.string().uuid();
export const RoomParticipantIdSchema = z.string().uuid();

export type RoomId = z.infer<typeof RoomIdSchema>;
export type RoomParticipantId = z.infer<typeof RoomParticipantIdSchema>;
