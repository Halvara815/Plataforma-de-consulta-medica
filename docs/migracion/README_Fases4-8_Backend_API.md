# Guía de Trabajo: Fases 4 a 8 — Desarrollo de la API Backend

> **Objetivo:** Construir los módulos de la API REST en NestJS (Controladores y Servicios) para reemplazar la lógica de `dataService.js`, incluyendo la autenticación y el manejo de archivos (documentos).

## Fase 4: Autenticación (Auth y JWT)

El frontend actualmente tiene al doctor hardcodeado en `state.js`.
1. **Módulo de Auth (`server/src/modules/auth`):**
   - Implementar `AuthService` para login (`login(email, password)`).
   - Implementar `JwtStrategy` usando `@nestjs/jwt` y Passport para proteger las rutas.
2. **Controlador:** Crear el endpoint `POST /api/v1/auth/login` que retorne el JWT token.
3. **Guards:** Crear un `JwtAuthGuard` que se aplique globalmente o por controlador para asegurar que todas las peticiones a la API tengan un token válido.

## Fase 5: Módulos Core (Pacientes y Catálogos)

Este es el primer módulo de datos a exponer.
1. **Pacientes (`server/src/modules/pacientes`):**
   - **Controlador:**
     - `GET /pacientes` (con paginación y búsqueda).
     - `GET /pacientes/:id` (obtener detalles completos incluyendo alergias y alertas).
     - `POST /pacientes`
     - `PUT /pacientes/:id`
   - **DTOs:** Crear `CreatePacienteDto` y `UpdatePacienteDto` con validaciones (ej. `@IsString()`, `@IsOptional()`).
2. **Catálogos:**
   - Crear un endpoint `GET /catalogos` que retorne todos los diccionarios (diagnósticos, medicamentos, etc.) para inicializar el frontend al hacer login, o endpoints separados (`GET /catalogos/diagnosticos`).

## Fase 6: Módulo Clínico Base (Consultas y Citas)

1. **Citas (`server/src/modules/citas`):**
   - `GET /citas` (filtradas por fecha y médico, para la agenda).
   - `POST /citas` (agendar cita).
   - `PATCH /citas/:id/estado` (cambiar estado a confirmada, pendiente, etc.).
2. **Consultas (`server/src/modules/consultas`):**
   - `GET /pacientes/:pacienteId/consultas` (historial del paciente).
   - `POST /consultas` (registrar nueva consulta, guardar signos vitales y diagnósticos).
   - `GET /consultas/:id` (ver detalle de consulta).

## Fase 7: Módulo Clínico Avanzado (Recetas y Estudios)

1. **Recetas:**
   - Crear endpoint para generar recetas vinculadas a una consulta o independientes.
   - Guardar el array de medicamentos y las interacciones detectadas.
2. **Estudios:**
   - Crear endpoints para solicitar estudios de laboratorio o imagen.
   - Endpoint para actualizar el estado del estudio (ej. "en_proceso" -> "completado").

## Fase 8: Módulo de Archivos (Documentos y MinIO)

El frontend maneja subida de documentos e imágenes.
1. **Almacenamiento (S3 / MinIO o File System):**
   - Configurar `@nestjs/platform-express` y `multer` para manejar `multipart/form-data`.
   - Si es local, guardar en una carpeta `/uploads` servida estáticamente. Si es producción, conectar a AWS S3 o MinIO.
2. **Controlador de Documentos:**
   - `POST /documentos/upload` (recibe archivo físico, retorna URL).
   - `POST /documentos` (guarda los metadatos en la base de datos vinculados al `pacienteId`).
   - `GET /pacientes/:pacienteId/documentos` (listar documentos del paciente).

## Criterios de Aceptación Globales
- [ ] Todos los endpoints están protegidos por JWT.
- [ ] Swagger está configurado (vía `@nestjs/swagger`) y expuesto en `/api/docs`.
- [ ] La API retorna códigos de estado HTTP correctos (200, 201, 400, 401, 404).
- [ ] Postman o una herramienta similar puede ejecutar el flujo completo (Login -> Crear Paciente -> Crear Cita -> Ver Paciente).
