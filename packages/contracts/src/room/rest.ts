import { z } from "zod";
import { ChatSchema } from "../chat/base.js";
import { UserSchema } from "../user/rest.js";
import { RoomIdSchema, RoomParticipantIdSchema } from "./base.js";

export const RoomSchema = z.object({
	id: RoomIdSchema,
	name: z.string(),
	description: z.string().nullable(),
});

export const RoomIdParamsSchema = z.object({
	id: RoomIdSchema,
});

export const RoomParticipantSchema = z.object({
	id: RoomParticipantIdSchema,
	isReady: z.boolean(),
	userId: z.string().uuid(),
	user: UserSchema,
});

export const RoomWithParticipantsSchema = RoomSchema.extend({
	participants: z.array(RoomParticipantSchema),
});

export const RoomWithParticipantsAndChatSchema = RoomWithParticipantsSchema.extend(
	{
		chat: ChatSchema,
	},
);

export const CreateRoomPayloadSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	userIds: z.array(z.string().uuid()).min(1),
});

export const UpdateRoomPayloadSchema = CreateRoomPayloadSchema.partial();

export type Room = z.infer<typeof RoomSchema>;
export type RoomIdParams = z.infer<typeof RoomIdParamsSchema>;
export type RoomParticipant = z.infer<typeof RoomParticipantSchema>;
export type RoomWithParticipants = z.infer<typeof RoomWithParticipantsSchema>;
export type RoomWithParticipantsAndChat = z.infer<
	typeof RoomWithParticipantsAndChatSchema
>;
export type CreateRoomPayload = z.infer<typeof CreateRoomPayloadSchema>;
export type UpdateRoomPayload = z.infer<typeof UpdateRoomPayloadSchema>;
