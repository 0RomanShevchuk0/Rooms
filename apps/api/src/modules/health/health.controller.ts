import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Controller('health')
export class HealthController {
	constructor(private prisma: PrismaService) {}

	@Get()
	async check() {
		try {
			await this.prisma.$queryRaw`SELECT 1`;
		} catch {
			// Reported as 503 so orchestrators treat the instance as unhealthy
			// while the process itself stays up and keeps retrying.
			throw new ServiceUnavailableException({
				status: 'error',
				database: 'down',
			});
		}

		return { status: 'ok', database: 'up' };
	}
}
