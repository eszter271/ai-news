import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(new Logger('Exception')));

  app.enableCors({
    origin: (config.get<string>('CORS_ORIGIN') || 'http://localhost:5173')
      .split(',')
      .map((s) => s.trim()),
    credentials: true,
  });

  const port = config.get<number>('PORT') || 3000;
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`🚀 API ready at http://localhost:${port}/api`);
  logger.log(
    `📚 DB: ${config.get<string>('DATABASE_URL')?.split(':')[0] || 'sqlite'}`,
  );
  logger.log(
    config.get('DEV_FIXED_CODE')
      ? `📧 验证码模式：固定码 ${config.get('DEV_FIXED_CODE')}（仅开发用）`
      : '📧 验证码模式：随机 6 位',
  );
}

bootstrap();
