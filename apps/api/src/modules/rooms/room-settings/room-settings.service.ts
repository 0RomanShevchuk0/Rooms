import { Injectable } from '@nestjs/common';
import type { SnakeGameSettings } from '@rooms/contracts/snake-game';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DEFAULT_SNAKE_GAME_SETTINGS } from './room-settings.constants';
import { toSnakeGameSettings } from './room-settings.mapper';

@Injectable()
export class RoomSettingsService {
	constructor(private readonly prisma: PrismaService) {}

	async getSnakeSettings(roomId: string): Promise<SnakeGameSettings> {
		const roomSettings = await this.prisma.roomSnakeSettings.upsert({
			where: { roomId },
			update: {},
			create: {
				roomId,
				fieldWidth: DEFAULT_SNAKE_GAME_SETTINGS.fieldSize.width,
				fieldHeight: DEFAULT_SNAKE_GAME_SETTINGS.fieldSize.height,
			},
		});

		return toSnakeGameSettings(roomSettings);
	}

	async updateSnakeSettings(
		roomId: string,
		settings: SnakeGameSettings,
	): Promise<SnakeGameSettings> {
		const roomSettings = await this.prisma.roomSnakeSettings.upsert({
			where: { roomId },
			update: {
				fieldWidth: settings.fieldSize.width,
				fieldHeight: settings.fieldSize.height,
			},
			create: {
				roomId,
				fieldWidth: settings.fieldSize.width,
				fieldHeight: settings.fieldSize.height,
			},
		});

		return toSnakeGameSettings(roomSettings);
	}
}
