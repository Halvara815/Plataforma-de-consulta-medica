import './theme.js';
import { initTheme, loadThemePreference } from './theme.js';
import { appState, toggleSidebarMobile } from './state.js';
import { initDataService, restoreSession } from './services/dataService.js';
import { mountSidebar } from './components/sidebar.js';
import { mountTopbar } from './components/topbar.js';
import { initRouter, navigateTo } from './router.js';

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

async function restoreExistingSession() {
  try {
    await initDataService();
    const currentUser = await restoreSession();
    try {
      await loadThemePreference();
    } catch (error) {
      console.warn('No se pudieron cargar las preferencias de interfaz.', error);
    }
    appState.setState({ currentUser, dataReady: true });
    navigateTo('#/dashboard');
  } catch (error) {
    // Abrir sin sesión y con la API apagada es válido: el formulario permanece disponible.
    console.info('No hay sesión restaurable o la API local aún no está disponible.', error);
  }
}

function bootstrap() {
  // El login se monta primero para que Live Server no bloquee el acceso visual
  // mientras NestJS inicia o no existe todavía una sesión.
  appState.setState({ currentUser: null, dataReady: false });
  initRouter(contentEl);
  void restoreExistingSession();
}

bootstrap();
