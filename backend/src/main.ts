import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('ODSIE API')
    .setDescription('API del Sistema de Historias Clínicas Digitales ODSIE')
    .setVersion('2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Autenticación y registro de usuarios')
    .addTag('Users', 'Gestión de usuarios')
    .addTag('Patients', 'Gestión de pacientes')
    .addTag('Medical Records', 'Historias clínicas')
    .addTag('Files', 'Archivos médicos')
    .addTag('Payments', 'Pagos mensuales')
    .addTag('Notifications', 'Notificaciones')
    .addTag('Activity Logs', 'Logs de actividad')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'ODSIE API Docs',
  });

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
  ║  📚 Swagger: http://localhost:${port}/api/docs ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
  `);
}

bootstrap();
