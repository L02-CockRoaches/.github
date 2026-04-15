import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

async function bootstrap() {
  // Load .env manual trước khi NestJS ConfigModule khởi động để lấy cho Sentry
  require('dotenv').config();

  // Khởi tạo Sentry ngay lúc app bắt đầu chạy
  Sentry.init({
    dsn: process.env.SENTRY_DSN, // Lấy từ biến môi trường
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Tracing (Monitor hiệu năng: API nào chạy chậm)
    tracesSampleRate: 1.0,
  });
  const app = await NestFactory.create(AppModule);

  // 1. API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 2. CORS for Frontend
  app.enableCors();

  // 3. Global Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // 4. Global Logging Interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 5. Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('GameTwoShape API')
    .setDescription('Backend for GameTwoShape (L02-CockRoaches)')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 6. Listen on Port
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}/api`);
}
bootstrap();
