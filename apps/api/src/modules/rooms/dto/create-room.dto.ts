import { ArrayNotEmpty, IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRoomDto {
	@IsString()
	name: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsArray()
	@ArrayNotEmpty()
	@IsUUID('4', { each: true })
	participantIds: string[];
}
