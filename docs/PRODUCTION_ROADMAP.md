# Ruta a producción (Etapa 2)

Este documento describe cómo evolucionar el prototipo de la Fase 1 (100% frontend, sin backend, datos
ficticios en JSON) hacia un sistema de consulta médica listo para producción, con datos reales de
pacientes, cumplimiento normativo y operación multiusuario.

## 1. Objetivo de la etapa 2

Reemplazar cada pieza "simulada" de la Fase 1 por su equivalente real, sin rediseñar la experiencia de
usuario ya validada: la Fase 1 existe precisamente para que este rediseño de UX no tenga que repetirse.

## 2. Stack tecnológico propuesto

| Capa | Fase 1 (actual) | Etapa 2 (producción) |
|---|---|---|
| Lenguaje | JavaScript ES Modules | **TypeScript** en frontend y backend |
| Frontend | HTML/CSS/JS + Vite, sin framework | **React** o **Vue** (sobre el mismo Vite), con el diseño visual y componentes ya validados en la Fase 1 como referencia directa |
| Backend | Ninguno (todo en el navegador) | **Node.js** con **NestJS** (o Express si se prioriza simplicidad) exponiendo una API REST/GraphQL |
| Base de datos | JSON estático + IndexedDB local | **PostgreSQL** como almacén transaccional principal |
| Caché / sesiones | `localStorage` (solo UI) | **Redis** para sesiones, caché de catálogos (CIE-10, medicamentos) y rate limiting |
| Autenticación | Usuario médico simulado (`state.js`) | **JWT** (access + refresh token), roles por perfil (médico, administrativo, paciente) |
| Contenedores | `npm run dev` local | **Docker** (imágenes por servicio: frontend, API, base de datos, caché) + `docker-compose` para entorno local reproducible |
| Servidor web / proxy | Servidor de desarrollo de Vite | **Nginx** como reverse proxy, servido de estáticos y terminación TLS |
| Transporte | HTTP local | **HTTPS** obligatorio de extremo a extremo (certificados gestionados, HSTS) |
| Auditoría | Ninguna | Bitácora de auditoría inmutable (quién vio/editó qué expediente y cuándo), requisito típico de NOM-024-SSA3-2012 y regulaciones equivalentes |
| Respaldos | Exportar/importar JSON manual (botón en Configuración) | Respaldos automáticos programados de PostgreSQL (point-in-time recovery) y de archivos clínicos |
| Interoperabilidad clínica | Ninguna | **HL7 FHIR** para intercambio de expedientes/recursos clínicos y **DICOMweb** para imágenes médicas (sustituyendo el visor simulado de `documentos.js`) |

## 3. Mapeo directo Fase 1 → Etapa 2

- `src/js/services/dataService.js` → se convierte en un cliente HTTP (fetch/axios o generado desde
  el contrato OpenAPI/GraphQL de NestJS). La interfaz pública (`getAll`, `getById`, `create`,
  `update`, `remove`) se mantiene igual desde el punto de vista de los módulos, para minimizar el
  cambio en `src/js/modules/*`.
- `src/js/storage.js` (IndexedDB) → deja de ser la fuente de persistencia; su rol se reduce a caché
  offline opcional (Service Worker / PWA) sobre datos que ya viven en PostgreSQL.
- `src/data/*.json` → se convierten en migraciones/seeds de PostgreSQL (o fixtures de prueba), nunca
  en la fuente de verdad.
- `src/js/router.js` (hash routing manual) → se reemplaza por el router de React/Vue (React Router o
  Vue Router) con rutas basadas en historial (sin `#`).
- Componentes (`sidebar.js`, `topbar.js`, `card.js`, `table.js`, `modal.js`, `form.js`, `tabs.js`) →
  se portan 1:1 a componentes de React/Vue tipados, reutilizando las clases CSS de
  `src/styles/*.css` como punto de partida del sistema de diseño.
- `docs/PRODUCTION_ROADMAP.md` (este archivo) → se convierte en el plan de trabajo real del equipo
  (tickets, épicas, hitos).

## 4. Seguridad y cumplimiento

- Autenticación con JWT de corta duración + refresh tokens rotativos; roles y permisos por endpoint.
- Cifrado en tránsito (HTTPS/TLS) y en reposo (cifrado a nivel de base de datos/disco para datos
  clínicos sensibles).
- Auditoría de acceso a expedientes (lectura y escritura), con retención acorde a la normativa local
  aplicable (p. ej. NOM-024-SSA3-2012 en México).
- Validación de entradas en el backend (nunca confiar solo en la validación de formularios del
  frontend, que en la Fase 1 es únicamente de UX).
- Gestión de secretos (variables de entorno, vault) fuera del control de versiones.

## 5. Interoperabilidad clínica

- Modelar pacientes, consultas, diagnósticos y medicamentos como recursos **HL7 FHIR** (`Patient`,
  `Encounter`, `Condition`, `MedicationRequest`, etc.), permitiendo integración con otros sistemas de
  salud.
- Sustituir el visor simulado de imágenes de `documentos.js` por un visor conectado a un servidor
  **DICOMweb** (QIDO-RS/WADO-RS) para estudios de imagenología reales.

## 6. Infraestructura y despliegue

- Contenerizar cada servicio (frontend, API, base de datos, Redis) con Docker.
- Orquestar el entorno local con `docker-compose`; producción sobre Kubernetes o un PaaS gestionado
  según el volumen esperado.
- Nginx como capa de entrada: TLS, compresión, cabeceras de seguridad, y proxy hacia la API de
  NestJS.
- Respaldos automatizados y monitoreados de PostgreSQL, con pruebas periódicas de restauración.
- Observabilidad: logs centralizados, métricas y alertas (más allá del alcance de este documento,
  pero a considerar desde el diseño de la API).

## 7. Orden sugerido de migración

1. Definir el esquema de PostgreSQL a partir de los modelos JSON de la Fase 1 (`src/data/*.json`)
   como punto de partida.
2. Construir la API en NestJS replicando los mismos contratos que hoy expone `dataService.js`.
3. Añadir autenticación JWT y control de acceso por rol.
4. Migrar el frontend a React o Vue, reutilizando estilos y estructura de componentes ya validados.
5. Incorporar Redis, Docker, Nginx y HTTPS al pipeline de despliegue.
6. Añadir auditoría, respaldos automatizados y cumplimiento normativo.
7. Integrar HL7 FHIR y DICOMweb para interoperabilidad clínica real.
