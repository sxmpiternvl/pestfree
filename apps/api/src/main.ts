import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  // Global request validation (DTO with class-validator).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS — allow web origin in dev, optional comma-separated list in prod.
  const corsEnv = process.env.WEB_ORIGIN ?? 'http://localhost:3000';
  const origins = corsEnv.split(',').map((s) => s.trim()).filter(Boolean);
  app.enableCors({
    origin: origins.length === 1 ? origins[0] : origins,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: false,
  });

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  Logger.log(`API listening on http://localhost:${port}`, 'Bootstrap');
  Logger.log(`CORS origins: ${origins.join(', ')}`, 'Bootstrap');
}

bootstrap();
