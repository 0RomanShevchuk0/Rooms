import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomParticipantDto } from './create-room-participant.dto';

export class UpdateRoomParticipantDto extends PartialType(
	CreateRoomParticipantDto,
) {}
