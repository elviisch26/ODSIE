# ODSIE - Sistema de Historias Clínicas Digitales

Sistema web integral para la gestión de historias clínicas digitales con códigos QR únicos, desarrollado con tecnologías modernas y escalables.

## Descripción del Proyecto

ODSIE es una plataforma completa que permite:
- Gestión digital de historias clínicas de pacientes
- Generación de códigos QR únicos para acceso rápido
- Sistema de roles multinivel (Paciente, Personal de Salud, Administrador)
- Control de acceso y permisos granulares
- Gestión de pagos y suscripciones mensuales
- Sistema de notificaciones automáticas
- Logs de actividad con trazabilidad completa
- Almacenamiento seguro de archivos médicos multimedia

##  Arquitectura del Sistema

```
ODSIE/
├── backend/          # API REST con NestJS + Supabase
├── frontend/         # Aplicación React + TypeScript + Vite
├── database/         # Esquemas SQL de Supabase
```

### Stack Tecnológico

#### **Backend**
- **Framework**: NestJS 10
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Passport
- **Storage**: Supabase Storage
- **ORM**: Supabase Client
- **Email**: Nodemailer
- **QR Generation**: qrcode
- **Validation**: class-validator

#### **Frontend**
- **Library**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Inicio Rápido

### Prerequisitos

- Node.js 18 o superior
- npm o yarn
- Cuenta en Supabase (gratis en [supabase.com](https://supabase.com))

### 1. Clonar o Descargar el Proyecto

```bash
cd ODSIE
```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el script `backend/database/schema.sql`
3. Ve a **Storage** y crea un bucket llamado `medical-files`
4. Obtén tus credenciales en **Settings > API**:
   - Project URL
   - Anon Key
   - Service Role Key (mantener segura)

### 3. Configurar Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tus credenciales de Supabase
npm run start:dev
```

El backend correrá en `http://localhost:3000`

### 4. Configurar Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Verifica que VITE_API_URL apunte a tu backend
npm run dev
```

El frontend correrá en `http://localhost:5173`

## Documentación Detallada

### Backend
Ver [backend/README.md](backend/README.md) para:
- Endpoints de la API
- Configuración de Supabase
- Esquema de base de datos
- Roles y permisos
- Deployment

### Frontend
Ver [frontend/README.md](frontend/README.md) para:
- Estructura de componentes
- Gestión de estado
- Rutas y navegación
- Integración con API
- Deployment

## Roles del Sistema

### Paciente
- Ver su propia historia clínica
- Subir archivos (síntomas, recetas)
- Generar y descargar código QR personal
- Ver notificaciones de acceso a su historia
- Gestionar pagos mensuales

### Personal de Salud
Incluye: Doctor, Psicólogo, Licenciado, Ginecólogo, Técnico APS

- Buscar y visualizar pacientes
- Ver historias clínicas
- **Solo Doctores**: Crear, editar y firmar historias clínicas
- Subir archivos médicos (exámenes, imágenes)
- Registro SENESCYT obligatorio

### Administrador
- Acceso total al sistema
- Gestionar usuarios y pacientes
- Ver y editar cualquier historia clínica
- Gestionar pagos y suscripciones
- Bloquear/desbloquear cuentas
- Ver logs de actividad del sistema
- Enviar notificaciones
- Estadísticas y reportes

## Seguridad

- **Autenticación**: JWT con expiración configurable
- **Contraseñas**: Hasheadas con bcrypt (salt rounds: 10)
- **Row Level Security**: Políticas RLS en Supabase
- **Guards**: Protección de rutas por rol en backend y frontend
- **Validación**: Validación de datos en ambos lados
- **HTTPS**: Recomendado para producción
- **CORS**: Configuración restrictiva

## Sistema de Pagos

- Suscripción mensual por paciente
- Detección automática de pagos pendientes
- **Bloqueo automático** de cuentas con deudas
- **Reactivación automática** al ponerse al día
- Histórico completo de pagos
- Múltiples métodos de pago

## Módulos Principales

### Historias Clínicas
- Creación con fecha y doctor asignado
- Motivo de consulta, síntomas, diagnóstico, tratamiento
- **Firma digital** del doctor
- Historial cronológico completo
- Edición solo por doctor creador (o admin)

### Archivos Médicos
Carpetas organizadas por tipo:
- **Síntomas**: Audio, video, texto del paciente
- **Recetas**: Fotos y documentos de tratamientos
- **Exámenes**: Resultados de laboratorio
- **Imágenes Médicas**: Radiografías, ecografías, resonancias, etc.

### Códigos QR
- Generación automática para cada paciente
- URL única y segura
- Acceso rápido a carpeta clínica
- Regenerable en cualquier momento
- Descargable en formato imagen

### Notificaciones
- **Email automático** en cada acceso a historia clínica
- Detalles: fecha, hora, IP, ubicación
- Notificaciones in-app
- Sistema de alertas de pagos

### Activity Logs
Registro completo de:
- Inicios de sesión
- Accesos a historias clínicas
- Modificaciones de datos
- IP y ubicación
- Timestamp de cada acción

## Endpoints Principales

### Auth
```
POST /api/auth/register  - Registrar usuario
POST /api/auth/login     - Iniciar sesión
```

### Patients
```
GET  /api/patients/me              - Mi perfil de paciente
GET  /api/patients/qr/:token       - Acceder por QR
POST /api/patients/:id/generate-qr - Generar código QR
```

### Medical Records
```
POST   /api/medical-records                - Crear historia (Doctor)
GET    /api/medical-records/patient/:id    - Ver historias
POST   /api/medical-records/:id/sign       - Firmar digitalmente
PATCH  /api/medical-records/:id            - Editar historia
```

### Files
```
POST   /api/files/upload          - Subir archivo
GET    /api/files/patient/:id     - Archivos del paciente
DELETE /api/files/:id             - Eliminar archivo
```

### Payments
```
GET   /api/payments/patient/:id         - Pagos del paciente
GET   /api/payments/patient/:id/pending - Pagos pendientes
PATCH /api/payments/:id/pay             - Marcar como pagado
```



##  Deployment

### Backend (Railway / Render / Heroku)
1. Configurar variables de entorno
2. Conectar repositorio Git
3. Deploy automático en cada push

### Frontend (Vercel / Netlify)
1. Conectar repositorio
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Variable: `VITE_API_URL`

### Base de Datos
- Supabase maneja todo automáticamente
- Backups diarios automáticos
- Escalado según demanda

## Testing

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

## Variables de Entorno

### Backend (.env)
```env
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=tu_url
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_key

# JWT
JWT_SECRET=clave_secreta
JWT_EXPIRATION=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email
EMAIL_PASSWORD=tu_password

FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## Contribuir

Este es un proyecto educativo/demo. Para contribuir:
1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es de código abierto bajo licencia MIT.

## Soporte

Para preguntas o problemas:
- Revisa la documentación en `/backend/README.md` y `/frontend/README.md`
- Abre un issue en el repositorio
- Contacta al equipo de desarrollo

##  Roadmap

###  Versión 1.0 (Actual)
- Sistema de autenticación
- Gestión básica de historias clínicas
- Códigos QR
- Sistema de pagos
- Notificaciones por email
- Dashboards por rol

###  Versión 1.1
- Notificaciones en tiempo real (WebSockets)
- Chat entre paciente y doctor
- Videoconsultas
- Calendario de citas

###  Versión 2.0
- App móvil (React Native)
- Reconocimiento de voz para historias
- IA para sugerencias de diagnóstico
- Integración con wearables


---

**© 2025 ODSIE - Sistema de Historias Clínicas Digitales**

Desarrollado con <3 para intentar mejorar la gestión de salud digital
