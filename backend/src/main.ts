import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ativa validação global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove campos que não estão no DTO (segurança)
    forbidNonWhitelisted: true, // Da erro se mandarem campo extra
  }));

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
