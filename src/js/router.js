import { appState } from './state.js';
import { parseQuery } from './utils.js';

const routes = [
  { path: '/dashboard', name: 'dashboard', loader: () => import('./modules/dashboard.js') },
  { path: '/pacientes', name: 'pacientes', loader: () => import('./modules/pacientes.js') },
  { path: '/pacientes/:id', name: 'pacientes', loader: () => import('./modules/pacientes.js') },
  {
    path: '/historia-clinica/:id',
    name: 'historiaClinica',
    loader: () => import('./modules/historiaClinica.js')
  },
  { path: '/consulta/:id', name: 'consulta', loader: () => import('./modules/consulta.js') },
  { path: '/agenda', name: 'agenda', loader: () => import('./modules/agenda.js') },
  { path: '/recetas', name: 'recetas', loader: () => import('./modules/recetas.js') },
  { path: '/documentos', name: 'documentos', loader: () => import('./modules/documentos.js') },
  { path: '/reportes', name: 'reportes', loader: () => import('./modules/reportes.js') },
  {
    path: '/configuracion',
    name: 'configuracion',
    loader: () => import('./modules/configuracion.js')
  }
];

const DEFAULT_ROUTE = '#/dashboard';

let container = null;
let activeModule = null;

function parseHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/dashboard';
  const [pathPart, queryPart = ''] = raw.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  return { segments, query: parseQuery(queryPart) };
}

function matchRoute(segments) {
  for (const route of routes) {
    const routeSegments = route.path.split('/').filter(Boolean);
    if (routeSegments.length !== segments.length) continue;
    const params = {};
    let matched = true;
    routeSegments.forEach((part, i) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = decodeURIComponent(segments[i]);
      } else if (part !== segments[i]) {
        matched = false;
      }
    });
    if (matched) return { route, params };
  }
  return null;
}

async function renderRoute() {
  if (!container) return;
  const { segments, query } = parseHash();
  const match = matchRoute(segments) || matchRoute(['dashboard']);

  if (activeModule && typeof activeModule.unmount === 'function') {
    try {
      activeModule.unmount();
    } catch (err) {
      console.error('Error al desmontar el módulo anterior', err);
    }
  }

  container.innerHTML = '<div class="loading-state">Cargando…</div>';
  appState.setState({ route: { name: match.route.name, params: match.params, query } });

  try {
    const mod = await match.route.loader();
    activeModule = mod;
    await mod.mount(container, match.params, query);
  } catch (err) {
    console.error('Error al cargar el módulo', err);
    container.innerHTML = `<div class="empty-state">No se pudo cargar esta sección. Revisa la consola para más detalles.</div>`;
  }
}

export function initRouter(appContainer) {
  container = appContainer;
  if (!window.location.hash) {
    window.location.hash = DEFAULT_ROUTE;
  }
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
}

export function navigateTo(path) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
}

export function getActiveRouteName() {
  return appState.getState().route?.name || null;
}
