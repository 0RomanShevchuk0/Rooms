import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { RoomSettingsService } from './room-settings.service';

@Module({
	imports: [PrismaModule],
	providers: [RoomSettingsService],
	exports: [RoomSettingsService],
})
export class RoomSettingsModule {}
