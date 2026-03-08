import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomPartisipantDto } from './create-room-partisipant.dto';

export class UpdateRoomPartisipantDto extends PartialType(
	CreateRoomPartisipantDto,
) {}
