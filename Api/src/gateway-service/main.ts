import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { GatewayServiceModule } from './gateway-service.module';

async function bootstrap() {
  const app = await NestFactory.create(GatewayServiceModule);
  const port = Number(process.env.GATEWAY_PORT ?? 3000);
  const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({ origin: corsOrigins, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port);
  console.log(`API Gateway listening on port ${port}`);
}

bootstrap();
