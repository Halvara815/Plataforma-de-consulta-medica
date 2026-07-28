import './theme.js';
import { initTheme } from './theme.js';
import { appState, toggleSidebarMobile } from './state.js';
import { initDataService, restoreSession, userFacingApiError } from './services/dataService.js';
import { mountSidebar } from './components/sidebar.js';
import { mountTopbar } from './components/topbar.js';
import { initRouter } from './router.js';
import { escapeHtml } from './utils.js';

initTheme();

const root = document.getElementById('app');

root.innerHTML = `
  <a href="#main-content" class="skip-link">Saltar al contenido principal</a>
  <div class="app-shell" id="app-shell">
    <aside class="sidebar" id="sidebar"></aside>
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <div class="app-main">
      <header class="topbar" id="topbar"></header>
      <main class="app-content" id="main-content" tabindex="-1"></main>
    </div>
  </div>
`;

const appShell = document.getElementById('app-shell');
const sidebarEl = document.getElementById('sidebar');
const topbarEl = document.getElementById('topbar');
const contentEl = document.getElementById('main-content');
const overlayEl = document.getElementById('sidebar-overlay');

mountSidebar(sidebarEl);
mountTopbar(topbarEl);

overlayEl.addEventListener('click', () => toggleSidebarMobile(false));

function syncShellClasses() {
  const { sidebarCollapsed, sidebarExpandedMobile } = appState.getState();
  appShell.classList.toggle('is-sidebar-collapsed', sidebarCollapsed);
  appShell.classList.toggle('is-sidebar-expanded', sidebarExpandedMobile);
}

syncShellClasses();
appState.subscribe(syncShellClasses);

async function bootstrap() {
  contentEl.innerHTML = '<div class="loading-state">Comprobando conexión segura…</div>';
  try {
    await initDataService();
    let currentUser = null;
    try {
      currentUser = await restoreSession();
    } catch (error) {
      if (error?.code !== 'AUTH_REQUIRED') throw error;
    }
    appState.setState({ currentUser, dataReady: Boolean(currentUser) });
    initRouter(contentEl);
  } catch (err) {
    console.error('No se pudo iniciar el cliente de datos', err);
    contentEl.innerHTML = `
      <section class="empty-state" role="alert">
        <h1>No se pudo conectar con el sistema</h1>
        <p>${escapeHtml(userFacingApiError(err))}</p>
        <button type="button" class="btn btn-secondary" data-action="retry-bootstrap">Reintentar</button>
      </section>
    `;
    contentEl.querySelector('[data-action="retry-bootstrap"]')?.addEventListener('click', bootstrap);
  }
}

bootstrap();
