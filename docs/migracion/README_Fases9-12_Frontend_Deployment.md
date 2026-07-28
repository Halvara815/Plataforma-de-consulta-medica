# Guía de Trabajo: Fases 9 a 12 — Integración Frontend y Despliegue

> **Objetivo:** Conectar la interfaz actual (Vanilla JS/Vite) al nuevo backend NestJS, retirar IndexedDB/localStorage y preparar el proyecto para producción.

## Fase 9: Conexión Frontend Base y Autenticación

El mayor cambio arquitectónico ocurre aquí, en el archivo `src/js/services/dataService.js`.
1. **Refactor de `dataService.js`:**
   - **Eliminar** todas las llamadas a `storage.js` e `IndexedDB`.
   - Implementar `fetch()` nativo o instalar `axios` para hacer llamadas a `http://localhost:3000/api/v1`.
2. **Implementación de Login:**
   - Eliminar el estado hardcodeado del doctor en `state.js`.
   - Crear la vista de login (`src/js/modules/login.js`) y registrar la ruta `#/login` en `router.js`.
   - Al hacer login exitoso, guardar el JWT (en memoria o HttpOnly cookie) y el perfil del médico en `appState`.
3. **Manejo del Token:**
   - Todas las llamadas de `dataService.js` deben inyectar el header `Authorization: Bearer <token>`.

## Fase 10: Refactor Asíncrono de Módulos (El mayor desafío)

En la Fase 1 descubrimos que **21 archivos** usan métodos de datos de forma síncrona (ej. `getAll()`, `getById()`, `query()`).
1. **Convertir funciones a `async/await`:**
   - En `dataService.js`, funciones como `getAll` ahora retornarán una Promesa.
   - En **todos los módulos consumidores** (ej. `dashboard.js`, `pacientes.js`), se debe modificar la lógica de inicialización (el método `mount()`) para ser asíncrona.
   ```javascript
   // ANTES (Síncrono):
   const pacientes = dataService.getAll('pacientes');
   renderTable(pacientes);

   // DESPUÉS (Asíncrono):
   const pacientes = await dataService.getAll('pacientes');
   renderTable(pacientes);
   ```
2. **Estados de Carga (Loaders):**
   - Mientras se esperan los datos de la red, mostrar spinners (el componente UI ya existe) o skeletons para no congelar la UI.

## Fase 11: Retiro de Código Legacy (Limpieza)

Una vez que todos los módulos consuman HTTP:
1. **Eliminar `src/data/*.json`:** La semilla ya no se necesita en el cliente; los datos vienen de PostgreSQL.
2. **Eliminar `src/js/storage.js`:** IndexedDB ya no se usa.
3. **Migrar Herramientas Personales:**
   - Cambiar la persistencia de las firmas, notas y plantillas (actualmente en `localStorage` usando prefijo `cp_ui_`) hacia endpoints del perfil del usuario en la API (`GET /perfil/notas`, `POST /perfil/notas`).
4. **Eliminar opciones de Configuración Local:** Remover el botón de "Reiniciar datos demo" en el módulo de configuración.

## Fase 12: Producción y Despliegue (CI/CD)

1. **Frontend (Vite):**
   - Ejecutar `npm run build`. 
   - Modificar variables de entorno en producción para apuntar a la URL real del backend (ej. `https://api.consultamedica.com/v1`).
2. **Backend (NestJS):**
   - Ejecutar `npm run build` en la carpeta `server/`.
   - Asegurarse de que `NODE_ENV=production`.
3. **Dockerización Total:**
   - Crear un `Dockerfile` para el Backend.
   - Crear un `Dockerfile` para el Frontend (sirviendo estáticos con Nginx).
   - Actualizar el `docker-compose.yml` para incluir las aplicaciones junto con Postgres y Redis.
4. **Seguridad:**
   - Habilitar Rate Limiting en NestJS.
   - Configurar HTTPS/SSL vía Nginx o un Load Balancer.
   - Habilitar respaldos (backups) automáticos de PostgreSQL.

## Criterios de Aceptación Globales
- [ ] Todo CRUD en el frontend se refleja instantáneamente en la base de datos PostgreSQL.
- [ ] No existen archivos `.json` de datos en la carpeta `src/`.
- [ ] IndexedDB no se utiliza para datos clínicos.
- [ ] Si se recarga la página, el estado de sesión se recupera validando el token.
- [ ] La aplicación se construye correctamente (`dist/`) sin errores de ESLint o dependencias rotas.
