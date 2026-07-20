# Consulta Práctica — Fase 1 (Localhost, sin backend)

Prototipo funcional de un sistema de consulta médica (EMR/EHR) que corre **100% en el navegador**,
pensado para validar pantallas, navegación, formularios y flujos clínicos antes de construir el
backend real. No se conecta a ninguna base de datos ni servidor: todos los datos son ficticios.

> ⚠️ **No usar con datos reales de pacientes.** Este proyecto es un prototipo de validación de UX/UI.

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Instalación y ejecución

```bash
npm install
npm run dev
```

La aplicación abre automáticamente en [http://localhost:5173](http://localhost:5173).

Otros scripts disponibles:

```bash
npm run build     # genera un build estático de producción en /dist (solo para revisión visual)
npm run preview   # sirve ese build localmente para probarlo
```

## ¿Qué incluye esta fase?

- **HTML5 + CSS3 + JavaScript (ES Modules) puros**, sin frameworks, servidos por Vite.
- **Hash routing** propio (`#/dashboard`, `#/pacientes/:id`, etc.) — ver `src/js/router.js`.
- **Datos ficticios en JSON** (`src/data/*.json`), importados como módulos ES y cargados en memoria
  al iniciar la app (`src/js/services/dataService.js`).
- **`localStorage`** solo para preferencias de interfaz (tema claro/oscuro).
- **`IndexedDB`** (opcional, con detección de soporte) para que las altas y ediciones que hagas
  durante la demo (nueva cita, nueva receta, nuevo documento, etc.) sobrevivan a un `F5`. Nunca se
  envía nada a un servidor.
- **Modo claro / oscuro**, sidebar colapsable, diseño responsive (desktop / tablet / mobile).

## Módulos

| Módulo | Ruta | Archivo |
|---|---|---|
| Dashboard clínico | `#/dashboard` | `src/js/modules/dashboard.js` |
| Gestión de pacientes | `#/pacientes`, `#/pacientes/:id` | `src/js/modules/pacientes.js` |
| Historia clínica (incluye tabs de signos vitales, diagnósticos y estudios) | `#/historia-clinica/:id` | `src/js/modules/historiaClinica.js` |
| Consulta médica (encuentro activo) | `#/consulta/:pacienteId` | `src/js/modules/consulta.js` |
| Agenda de citas | `#/agenda` | `src/js/modules/agenda.js` |
| Recetas / prescripción electrónica | `#/recetas` | `src/js/modules/recetas.js` |
| Imágenes y documentos | `#/documentos` | `src/js/modules/documentos.js` |
| Reportes | `#/reportes` | `src/js/modules/reportes.js` |
| Configuración (apariencia + respaldo local) | `#/configuracion` | `src/js/modules/configuracion.js` |

Los "signos vitales", "diagnósticos" y "órdenes de estudios" no son rutas independientes: viven como
pestañas dentro de **Historia Clínica** (consulta del expediente) y como campos del formulario de
**Consulta** (captura del encuentro activo), igual que en el prototipo visual original.

## Estructura del proyecto

```
consulta-medica-localhost/
  index.html
  package.json
  vite.config.js
  README.md
  docs/
    PRODUCTION_ROADMAP.md      # Ruta de migración a producción (ver más abajo)
  src/
    styles/                     # variables.css, main.css, responsive.css
    data/                        # JSON de datos ficticios (fuente de verdad de esta fase)
    js/
      main.js                    # bootstrap de la app
      router.js                   # hash router
      state.js                     # store observable mínimo
      storage.js                    # wrapper de localStorage + IndexedDB
      theme.js                       # modo claro/oscuro
      utils.js                        # helpers (fechas, IMC, charts SVG, etc.)
      services/dataService.js          # única puerta de entrada a los "datos"
      components/                       # sidebar, topbar, card, table, modal, form, tabs
      modules/                           # un archivo por módulo de la tabla de arriba
```

## Cómo funcionan los datos (importante)

1. Al iniciar, `dataService.js` importa los JSON de `src/data/` como módulos ES.
2. Si el navegador soporta IndexedDB, se cargan también los cambios guardados en sesiones
   anteriores (altas/ediciones) y se combinan con los datos base.
3. Cualquier alta o edición durante la demo (nuevo paciente, nueva cita, nueva receta, subir un
   "documento", cancelar una cita, etc.) actualiza la memoria y, si es posible, IndexedDB.
4. En **Configuración** puedes exportar un respaldo JSON de esos cambios, importarlo de vuelta, o
   restablecer la demo a su estado original.

Esto significa que refrescar la página **no pierde tus cambios** (si tu navegador soporta
IndexedDB), pero tampoco hay nada persistido fuera de tu propio navegador.

## Fecha de referencia de la demo

Las citas de ejemplo están concentradas en `2026-07-20` para que el Dashboard y la Agenda muestren
contenido representativo sin depender de la fecha real del sistema (ver la constante `DEMO_TODAY`
en `src/js/modules/dashboard.js` y `src/js/modules/agenda.js`).

## Siguiente etapa

Esta fase es intencionalmente solo-frontend. La ruta hacia un sistema de producción real (con base
de datos, autenticación, auditoría e interoperabilidad clínica) está documentada en
[`docs/PRODUCTION_ROADMAP.md`](docs/PRODUCTION_ROADMAP.md).
