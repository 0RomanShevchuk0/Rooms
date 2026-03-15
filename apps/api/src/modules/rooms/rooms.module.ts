import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomsWsGateway } from './ws/rooms-ws.gateway';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { RoomParticipantsService } from './participants/room-participants.service';

@Module({
	imports: [PrismaModule],
	controllers: [RoomsController],
	providers: [RoomsService, RoomsWsGateway, RoomParticipantsService],
})
export class RoomsModule {}
