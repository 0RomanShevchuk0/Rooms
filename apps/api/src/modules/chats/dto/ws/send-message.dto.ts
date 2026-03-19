import { IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
	@IsUUID()
	chatId: string;
	@IsUUID()
	senderId: string;
	@IsString()
	content: string;
}
