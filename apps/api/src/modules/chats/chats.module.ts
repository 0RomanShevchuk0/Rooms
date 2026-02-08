import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { PrismaModule } from 'src/database/prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [ChatsController],
	providers: [ChatsService],
})
export class ChatsModule {}
