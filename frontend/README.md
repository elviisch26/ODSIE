# ODSIE Frontend

Sistema de Historias Clínicas Digitales - Aplicación Web

##  Tecnologías

- **React 18** - Biblioteca de UI
- **TypeScript** - Lenguaje tipado
- **Vite** - Build tool ultrarrápido
- **TailwindCSS** - Framework de CSS
- **React Router** - Enrutamiento
- **Zustand** - Gestión de estado
- **React Query** - Gestión de datos async
- **Axios** - Cliente HTTP
- **React Hook Form** - Formularios
- **Lucide React** - Iconos

##  Requisitos Previos

- Node.js 18+
- npm o yarn

## 🔧 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

3. Editar `.env` con la URL de tu backend:
```
VITE_API_URL=http://localhost:3000/api
```

## 🏃 Ejecutar el Proyecto

### Modo desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build para producción:
```bash
npm run build
```

### Preview de la build:
```bash
npm run preview
```

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   └── layouts/       # Layouts de la app
│   ├── pages/             # Páginas/vistas
│   │   ├── auth/          # Login y registro
│   │   ├── patient/       # Dashboard de paciente y sus principales funciones 
│   │   ├── doctor/        # Dashboard de personal de salud 
│   │   └── admin/         # Dashboard de administrador
│   ├── lib/               # Utilidades y configuración
│   │   ├── api.ts         # Cliente API y endpoints
│   │   └── constants.ts   # Constantes globales
│   ├── store/             # Stores de Zustand
│   │   └── authStore.ts   # Estado de autenticación
│   ├── types/             # Tipos TypeScript
│   ├── routes/            # Configuración de rutas
│   ├── App.tsx            # Componente principal
│   ├── main.tsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

##  Autenticación

El sistema utiliza JWT para la autenticación. El token se almacena en localStorage y se envía en cada petición mediante interceptores de Axios.

### Rutas Protegidas

Las rutas están protegidas por roles:
- `/dashboard/patient` - Solo pacientes
- `/dashboard/doctor` - Personal de salud
- `/dashboard/admin` - Solo administradores

##  Estilos y Temas

Se utiliza TailwindCSS con una paleta de colores personalizada:
- Primary: Azul (#2563eb)
- Componentes predefinidos: btn, input, card

##  Gestión de Estado

### AuthStore (Zustand)
Maneja el estado de autenticación:
- `user` - Datos del usuario actual
- `token` - JWT token
- `isAuthenticated` - Estado de sesión
- `login()` - Iniciar sesión
- `logout()` - Cerrar sesión

##  Integración con Backend

Todos los endpoints están centralizados en `src/lib/api.ts`:

```typescript
// Ejemplo de uso
import { authAPI } from '@/lib/api';

const { data } = await authAPI.login({ email, password });
```

### Endpoints Principales

- **Auth**: `/auth/login`, `/auth/register`
- **Users**: `/users/me`, `/users/search`
- **Patients**: `/patients/me`, `/patients/:id/generate-qr`
- **Medical Records**: `/medical-records/patient/:id`
- **Files**: `/files/upload`, `/files/patient/:id`
- **Payments**: `/payments/patient/:id`
- **Notifications**: `/notifications/me`
- **Activity Logs**: `/activity-logs`

## Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview de la build
npm run lint         # Linter
```

## Despliegue

### Vercel (Recomendado)

1. Push el código a GitHub
2. Conecta el repositorio en Vercel
3. Configura la variable de entorno:
   - `VITE_API_URL`: URL de tu API en producción

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Variables de entorno: `VITE_API_URL`

### Otras plataformas

El proyecto genera archivos estáticos en `/dist` que pueden ser servidos por cualquier servidor web.

## Funcionalidades Implementadas

✅ Sistema de autenticación con JWT  
✅ Rutas protegidas por rol  
✅ Dashboards por tipo de usuario  
✅ Diseño responsive  
✅ Gestión de estado global  
✅ Formularios validados  
✅ Notificaciones toast  
✅ Loading states  
✅ Error handling  

##  Próximas Funcionalidades

🔲 Vista completa de historias clínicas  
🔲 Generación y descarga de QR  
🔲 Upload de archivos multimedia  
🔲 Sistema de notificaciones en tiempo real  
🔲 Chat entre paciente y doctor  
🔲 Calendario de citas  
🔲 Reportes y estadísticas  
🔲 Firma digital  

##  Mejores Prácticas

- **TypeScript**: Todo el código está tipado
- **Componentes**: Separados por funcionalidad
- **Hooks personalizados**: Para lógica reutilizable
- **Code splitting**: Lazy loading de rutas
- **SEO**: Meta tags configurados

##  Debug

### Problemas comunes

1. **Error de CORS**: Verifica que el backend tenga configurado CORS correctamente
2. **401 Unauthorized**: El token puede haber expirado, cierra sesión y vuelve a entrar
3. **Rutas no funcionan**: Verifica que estés usando la versión correcta de React Router

**© 2025 ODSIE - Sistema de Historias Clínicas Digitales**
