import { IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
	@IsUUID()
	chatId: string;

	@IsString()
	content: string;
}
