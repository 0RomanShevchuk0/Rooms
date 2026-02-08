import { IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
	@IsUUID()
	chatId: string;

	@IsString()
	content: string;

	// todo: get user from auth
	@IsUUID()
	senderId: string;
}
