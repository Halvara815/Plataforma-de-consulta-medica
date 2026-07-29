import { appState } from './state.js';
import { clearAuthSession, isAuthenticated, userFacingApiError } from './services/dataService.js';
import { escapeHtml, parseQuery } from './utils.js';

const routes = [
  { path: '/login', name: 'login', loader: () => import('./modules/login.js') },
  { path: '/dashboard', name: 'dashboard', loader: () => import('./modules/dashboard.js') },
  { path: '/pacientes', name: 'pacientes', loader: () => import('./modules/pacientes.js') },
  { path: '/pacientes/:id', name: 'pacientes', loader: () => import('./modules/pacientes.js') },
  { path: '/historia-clinica', name: 'historiaClinica', loader: () => import('./modules/historiaClinica.js') },
  { path: '/historia-clinica/:id', name: 'historiaClinica', loader: () => import('./modules/historiaClinica.js') },
  { path: '/consulta/:id', name: 'consulta', loader: () => import('./modules/consulta.js') },
  { path: '/agenda', name: 'agenda', loader: () => import('./modules/agenda.js') },
  { path: '/recetas', name: 'recetas', loader: () => import('./modules/recetas.js') },
  { path: '/documentos', name: 'documentos', loader: () => import('./modules/documentos.js') },
  { path: '/reportes', name: 'reportes', loader: () => import('./modules/reportes.js') },
  { path: '/calculadora', name: 'calculadora', loader: () => import('./modules/calculadora.js') },
  { path: '/herramientas', name: 'herramientas', loader: () => import('./modules/herramientas.js') },
  { path: '/configuracion', name: 'configuracion', loader: () => import('./modules/configuracion.js') },
  { path: '/administracion', name: 'administracion', loader: () => import('./modules/administracion.js') },
];

const DEFAULT_ROUTE = '#/dashboard';
const LOGIN_ROUTE = '#/login';

let container = null;
let activeModule = null;

function renderRouteError(error) {
  const message = userFacingApiError(error);
  container.innerHTML = `
    <section class="empty-state" role="alert">
      <h1>No se pudo cargar esta sección</h1>
      <p>${escapeHtml(message)}</p>
      <button type="button" class="btn btn-secondary" data-action="retry-route">Reintentar</button>
    </section>
  `;
  container.querySelector('[data-action="retry-route"]')?.addEventListener('click', renderRoute);
}

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
    routeSegments.forEach((part, index) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = decodeURIComponent(segments[index]);
      } else if (part !== segments[index]) {
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

  if (!isAuthenticated() && match.route.name !== 'login') {
    if (window.location.hash !== LOGIN_ROUTE) window.location.hash = LOGIN_ROUTE;
    return;
  }
  if (isAuthenticated() && match.route.name === 'login') {
    if (window.location.hash !== DEFAULT_ROUTE) window.location.hash = DEFAULT_ROUTE;
    return;
  }

  if (activeModule && typeof activeModule.unmount === 'function') {
    try {
      activeModule.unmount();
    } catch (error) {
      console.error('Error al desmontar el módulo anterior', error);
    }
  }

  container.innerHTML = '<div class="loading-state">Cargando…</div>';
  appState.setState({ route: { name: match.route.name, params: match.params, query } });

  try {
    const mod = await match.route.loader();
    activeModule = mod;
    await mod.mount(container, match.params, query);
  } catch (error) {
    if (error?.code === 'AUTH_REQUIRED') {
      clearAuthSession();
      appState.setState({ currentUser: null, dataReady: false });
      if (window.location.hash !== LOGIN_ROUTE) window.location.hash = LOGIN_ROUTE;
      return;
    }
    console.error('Error al cargar el módulo', error);
    renderRouteError(error);
  }
}

export function initRouter(appContainer) {
  container = appContainer;
  window.addEventListener('hashchange', renderRoute);
  if (!window.location.hash) {
    window.location.hash = isAuthenticated() ? DEFAULT_ROUTE : LOGIN_ROUTE;
    return;
  }
  renderRoute();
}

export function navigateTo(path) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
}

export function getActiveRouteName() {
  return appState.getState().route?.name || null;
}
