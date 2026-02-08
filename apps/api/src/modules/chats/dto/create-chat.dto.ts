import { IsUUID } from 'class-validator';

export class CreateChatDto {
	@IsUUID()
	roomId: string;
}
