import { Module } from '@nestjs/common';
import { SnakeService } from './snake.service';
import { SnakeGateway } from './snake.gateway';
import { RoomsModule } from 'src/modules/rooms/rooms.module';

@Module({
	imports: [RoomsModule],
	providers: [SnakeGateway, SnakeService],
})
export class SnakeModule {}
