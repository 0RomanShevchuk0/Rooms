import { ArrayNotEmpty, IsArray, IsString, IsUUID } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  participantIds: string[];
}
