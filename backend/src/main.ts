import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
<<<<<<< HEAD
=======
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
>>>>>>> 5e34437 (feat: integrate specialized brain-training backend and project handbook)

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

<<<<<<< HEAD
  // 1. API Versioning
=======
  // 1. Enable API Versioning (Default to v1)
>>>>>>> 5e34437 (feat: integrate specialized brain-training backend and project handbook)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

<<<<<<< HEAD
  // 2. CORS for Frontend
  app.enableCors();

  // 3. Global Validation
=======
  // 2. Enable CORS
  app.enableCors();

  // 3. Global Validation Pipe
>>>>>>> 5e34437 (feat: integrate specialized brain-training backend and project handbook)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
<<<<<<< HEAD

  // 4. Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Brain Training API')
    .setDescription('Backend for GameTwoShape (L02-CockRoaches)')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
=======
  
  // 4. Global Logging Interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 5. Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('Demo cho bài thuyết trình Web Service & Cloud')
    .setVersion('1.0.0')
    .addTag('auth')
    .addTag('tasks')
    .addBearerAuth() 
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 6. Listen on Port
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}/api`);
>>>>>>> 5e34437 (feat: integrate specialized brain-training backend and project handbook)
}
bootstrap();
