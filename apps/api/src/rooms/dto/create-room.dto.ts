import { ArrayNotEmpty, IsArray, IsString, IsUUID } from 'class-validator';

export class CreateRoomDto {
	@IsString()
	name: string;

	@IsString()
	description?: string;

	@IsArray()
	@ArrayNotEmpty()
	@IsUUID('4', { each: true })
	participantIds: string[];
}
