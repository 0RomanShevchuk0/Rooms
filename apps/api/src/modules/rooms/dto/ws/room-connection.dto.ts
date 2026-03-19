import { IsUUID } from 'class-validator';

export class RoomConnectionDto {
	@IsUUID()
	roomId: string;

	@IsUUID()
	participantId: string;
}
