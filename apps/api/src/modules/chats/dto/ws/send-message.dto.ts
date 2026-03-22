import { IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
	@IsUUID()
	chatId: string;
	@IsString()
	content: string;
}
