import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix('api');

	const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];
	app.enableCors({
		origin: [...allowedOrigins],
		methods: ['GET', 'POST', 'PATCH', 'DELETE'],
		credentials: true,
	});

	app.use(cookieParser());

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	await app.listen(process.env.PORT ?? 3000);
	console.log(`Application is running on port ${process.env.PORT ?? 3000}`);
}
void bootstrap();
