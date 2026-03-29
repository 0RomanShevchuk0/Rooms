import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

import { ApiSocketIoAdapter } from './realtime/ws/api-socket-io.adapter';
import { DomainErrorHttpFilter } from './shared/errors/domain-error-http.filter';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix('api');
	app.useWebSocketAdapter(new ApiSocketIoAdapter(app));

	const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];
	app.enableCors({
		origin: [...allowedOrigins],
		methods: ['GET', 'POST', 'PATCH', 'DELETE'],
		credentials: true,
	});

	app.use(cookieParser());
	app.useGlobalFilters(new DomainErrorHttpFilter());

	await app.listen(process.env.PORT ?? 3000);
	console.log(`Application is running on port ${process.env.PORT ?? 3000}`);
}
void bootstrap();
