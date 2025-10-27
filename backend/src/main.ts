import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Habilitar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefijo global para la API
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════╗
  ║                                           ║
  ║      🩺 ODSIE Backend Server 🩺          ║
  ║                                           ║
  ║  Sistema de Historias Clínicas Digitales ║
  ║                                           ║
  ║  Servidor corriendo en: ${port}              ║
  ║  Ambiente: ${process.env.NODE_ENV}             ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
  `);
}

bootstrap();
