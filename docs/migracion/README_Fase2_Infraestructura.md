# Guía de Trabajo: Fase 2 — Infraestructura Base (Backend)

> **Objetivo:** Establecer la base del nuevo backend con NestJS y la infraestructura de contenedores (Base de datos y Caché).

## 1. Inicialización del Proyecto NestJS

Debes crear una nueva carpeta `server` en la raíz del proyecto para mantener el backend separado del frontend actual.

```bash
# Instalar CLI de NestJS globalmente (si no lo tienes)
npm i -g @nestjs/cli

# Crear el proyecto en la carpeta 'server'
nest new server
```

### Dependencias a instalar en `server`:
```bash
cd server
npm install @nestjs/typeorm typeorm pg @nestjs/config class-validator class-transformer
npm install redis ioredis @nestjs/cache-manager cache-manager
```

## 2. Estructura de Carpetas Sugerida (Server)

```text
server/
├── src/
│   ├── common/
│   │   ├── filters/       # Exception filters globales
│   │   ├── interceptors/  # Interceptores (ej. logging)
│   │   └── guards/        # Auth guards (se usarán en Fase 4)
│   ├── config/            # Configuración (.env, base de datos)
│   ├── modules/
│   │   ├── pacientes/     # Módulo de pacientes
│   │   ├── citas/         # Módulo de citas
│   │   └── ...            # Resto de módulos (Fase 5, 6, 7)
│   ├── app.module.ts      # Módulo raíz
│   └── main.ts            # Entry point
```

## 3. Infraestructura Docker (PostgreSQL y Redis)

En la raíz del proyecto (fuera de `server`), crea un archivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password123
      POSTGRES_DB: consulta_medica
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

Para levantar la infraestructura:
```bash
docker-compose up -d
```

## 4. Configuración del Entry Point (`main.ts`)

En `server/src/main.ts`, debes configurar la validación global y el prefijo de la API:

```typescript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para el frontend (Vite corre en puerto 5173 por defecto)
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Prefijo global para la API
  app.setGlobalPrefix('api/v1');

  // Validación global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,       // Remueve campos que no estén en el DTO
    forbidNonWhitelisted: true, // Lanza error si hay campos no permitidos
    transform: true,       // Transforma tipos automáticamente
  }));

  await app.listen(3000);
}
bootstrap();
```

## 5. Criterios de Aceptación para esta Fase
- [ ] La carpeta `server` existe y contiene un proyecto NestJS base.
- [ ] `docker-compose up -d` levanta Postgres y Redis sin errores.
- [ ] El backend levanta en `http://localhost:3000/api/v1` y acepta peticiones (CORS configurado).
- [ ] Los DTOs tienen validación estricta (`ValidationPipe` global).
