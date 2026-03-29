export interface CreateRoomParticipantInput {
	roomId: string;
	userId: string;
	isReady?: boolean;
}
