import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { MessagesModule } from '../messages/messages.module';
import { ChatWsGateway } from './ws/chat-ws.gateway';
@Module({
	imports: [PrismaModule, MessagesModule],
	controllers: [ChatsController],
	providers: [ChatsService, ChatWsGateway],
})
export class ChatsModule {}
