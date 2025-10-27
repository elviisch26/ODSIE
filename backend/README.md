# ODSIE Backend

Sistema de Historias Clínicas Digitales - Backend API

## Tecnologías

- **NestJS** - Framework de Node.js
- **Supabase** - Base de datos PostgreSQL + Auth + Storage
- **TypeScript** - Lenguaje de programación
- **JWT** - Autenticación
- **QRCode** - Generación de códigos QR
- **Nodemailer** - Envío de emails

##  Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (gratis en supabase.com)

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

3. Editar `.env` con tus credenciales de Supabase:
   - Ve a tu proyecto en Supabase
   - Obtén la URL y las API Keys en Settings > API
   - Configura tu email para notificaciones

4. Crear la base de datos:
   - Ve a Supabase SQL Editor
   - Copia y ejecuta el contenido de `database/schema.sql`

5. Crear el bucket de storage:
   - Ve a Storage en Supabase
   - Crea un bucket llamado `medical-files`
   - Configúralo como público si deseas URLs públicas

##  Ejecutar el Proyecto

### Modo desarrollo:
```bash
npm run start:dev
```

### Modo producción:
```bash
npm run build
npm run start:prod
```

El servidor estará disponible en `http://localhost:3000`

##  Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Usuarios
- `GET /api/users/me` - Perfil del usuario actual
- `GET /api/users/search?q=query` - Buscar usuarios (Admin)

### Pacientes
- `GET /api/patients/me` - Datos del paciente actual
- `POST /api/patients/:id/generate-qr` - Generar código QR
- `GET /api/patients/qr/:token` - Acceder por QR

### Historias Clínicas
- `POST /api/medical-records` - Crear historia (Doctor)
- `GET /api/medical-records/patient/:id` - Ver historias del paciente
- `POST /api/medical-records/:id/sign` - Firmar digitalmente (Doctor)

### Archivos
- `POST /api/files/upload` - Subir archivo
- `GET /api/files/patient/:id` - Archivos del paciente

### Pagos
- `GET /api/payments/patient/:id` - Pagos del paciente
- `PATCH /api/payments/:id/pay` - Marcar como pagado (Admin)

### Notificaciones
- `GET /api/notifications/me` - Mis notificaciones
- `POST /api/notifications/mark-all-read` - Marcar todas como leídas

### Activity Logs
- `GET /api/activity-logs` - Ver logs (Admin)
- `GET /api/activity-logs/patient/:id` - Logs de un paciente

##  Roles y Permisos

- **PACIENTE**: Ver su propia información, subir archivos
- **DOCTOR**: Crear y firmar historias clínicas
- **PSICOLOGO/LICENCIADO/GINECOLOGO/TECNICO_APS**: Ver historias clínicas
- **ADMINISTRADOR**: Acceso total al sistema

##  Estructura del Proyecto

```
backend/
├── src/
│   ├── common/           # Código compartido
│   │   ├── enums/        # Enumeraciones
│   │   ├── interfaces/   # Interfaces TypeScript
│   │   └── supabase/     # Servicio de Supabase
│   ├── modules/          # Módulos de la aplicación
│   │   ├── auth/         # Autenticación
│   │   ├── users/        # Usuarios
│   │   ├── patients/     # Pacientes
│   │   ├── medical-records/   # Historias clínicas
│   │   ├── files/        # Gestión de archivos
│   │   ├── payments/     # Pagos y suscripciones
│   │   ├── notifications/     # Notificaciones
│   │   └── activity-logs/     # Logs de actividad
│   ├── app.module.ts     # Módulo principal
│   └── main.ts           # Punto de entrada
├── database/
│   └── schema.sql        # Esquema de base de datos
└── package.json
```

##  Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación JWT
- Row Level Security (RLS) en Supabase
- Guards de roles en endpoints protegidos
- Validación de datos con class-validator

##  Notas Importantes

1. **SENESCYT**: El personal de salud debe proporcionar su registro SENESCYT obligatoriamente
2. **Pagos**: El sistema bloquea automáticamente cuentas con pagos pendientes
3. **QR Codes**: Cada paciente tiene un código QR único para acceso rápido
4. **Logs**: Todas las acciones quedan registradas con IP y timestamp
5. **Notificaciones**: Se envían emails automáticos en accesos importantes

##  Configuración de Supabase

### Row Level Security (RLS)
Las políticas de RLS ya están incluidas en el schema.sql. Asegúrate de que RLS esté habilitado.

### Storage
Configura el bucket `medical-files` con las políticas adecuadas:
- Lectura: Solo usuarios autenticados
- Escritura: Solo propietarios y personal médico

## Despliegue

### Variables de entorno en producción:
- Cambia `JWT_SECRET` por una clave segura
- Usa credenciales SMTP reales para emails
- Configura `FRONTEND_URL` con tu dominio
- Asegura las keys de Supabase

### Recomendaciones:
- Usa Railway, Render, o Vercel para el deploy
- Configura HTTPS
- Habilita rate limiting
- Monitorea logs de errores



**© 2025 ODSIE - Sistema de Historias Clínicas Digitales**
