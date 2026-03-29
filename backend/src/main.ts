import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend running at http://localhost:${port}/api`);
}

bootstrap();
