import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomsWsGateway } from './ws/rooms-ws.gateway';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { RoomPartisipantsService } from './partisipants/room-partisipants.service';

@Module({
	imports: [PrismaModule],
	controllers: [RoomsController],
	providers: [RoomsService, RoomsWsGateway, RoomPartisipantsService],
})
export class RoomsModule {}
