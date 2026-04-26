import { Module } from '@nestjs/common';
import { SnakeService } from './snake.service';
import { SnakeGateway } from './snake.gateway';
import { RoomsModule } from 'src/modules/rooms/rooms.module';
import { RoomSettingsModule } from 'src/modules/rooms/room-settings/room-settings.module';

@Module({
	imports: [RoomsModule, RoomSettingsModule],
	providers: [SnakeGateway, SnakeService],
})
export class SnakeModule {}
