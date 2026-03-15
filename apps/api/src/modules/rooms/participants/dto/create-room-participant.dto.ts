import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateRoomParticipantDto {
	@IsUUID('4')
	roomId: string;

	@IsUUID('4')
	userId: string;

	@IsOptional()
	@IsBoolean()
	isReady?: boolean;
}
