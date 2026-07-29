import { appState, toggleSidebarCollapsed, toggleSidebarMobile } from '../state.js';
import { logout } from '../services/dataService.js';
import { initials } from '../utils.js';
import { icon } from '../icons.js';
import logoUrl from '../../assets/logo.webp';

const PATIENT_CONTEXT_ROUTES = ['pacientes', 'historiaClinica', 'consulta'];

const NAV_ITEMS = [
  { route: 'dashboard', path: '#/dashboard', label: 'Dashboard', icon: 'home' },
  { route: 'pacientes', path: '#/pacientes', label: 'Pacientes', icon: 'patients' },
  { route: 'historiaClinica', label: 'Historia Clínica', icon: 'history' },
  { route: 'agenda', path: '#/agenda', label: 'Citas / Agenda', icon: 'calendar' },
  { route: 'recetas', path: '#/recetas', label: 'Prescripciones', icon: 'prescription' },
  { route: 'documentos', path: '#/documentos', label: 'Imágenes / Documentos', icon: 'documents' },
  { route: 'reportes', path: '#/reportes', label: 'Reportes', icon: 'reports' },
  { route: 'calculadora', path: '#/calculadora', label: 'Calculadora', icon: 'calculator' },
  { route: 'herramientas', path: '#/herramientas', label: 'Herramientas', icon: 'wrench' },
  { route: 'configuracion', path: '#/configuracion', label: 'Configuración', icon: 'settings' },
  { route: 'administracion', path: '#/administracion', label: 'Administración', icon: 'shield', permission: 'usuarios:gestionar' }
];

export function mountSidebar(container) {
  function render() {
    const { route, currentUser, sidebarCollapsed } = appState.getState();
    const displayUser = currentUser ?? { nombre: 'Sin sesión', especialidad: 'Acceso requerido' };
    const activeName = route?.name;
    const contextPatientId = PATIENT_CONTEXT_ROUTES.includes(activeName) && route?.params?.id
      ? route.params.id
      : undefined;

    const navItems = NAV_ITEMS
      .filter((item) => !item.permission || currentUser?.permisos?.includes(item.permission))
      .map((item) =>
      item.route === 'historiaClinica'
        ? { ...item, path: contextPatientId ? `#/historia-clinica/${contextPatientId}` : '#/historia-clinica' }
        : item
      );

    container.innerHTML = `
      <div class="sidebar-brand">
        <span class="sidebar-brand-icon"><img src="${logoUrl}" alt="" /></span>
        <div class="sidebar-brand-text">
          <strong>Consulta Práctica</strong>
          <span>EMR / EHR · Demo local</span>
        </div>
      </div>
      <nav class="sidebar-nav" aria-label="Navegación principal">
        ${navItems.map(
          (item) => `
          <a class="sidebar-link${item.route === activeName ? ' is-active' : ''}" href="${item.path}" data-route="${item.route}">
            ${icon(item.icon, { size: 20 })}
            <span class="label">${item.label}</span>
          </a>`
        ).join('')}
      </nav>
      <button type="button" class="sidebar-toggle-btn" id="sidebar-collapse-toggle" aria-label="${sidebarCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}" title="${sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}">
        ${icon(sidebarCollapsed ? 'chevron-right' : 'chevron-left', { size: 16 })}
      </button>
      <div class="sidebar-footer">
        <span class="sidebar-footer-avatar">${initials(displayUser.nombre)}</span>
        <div class="sidebar-footer-text">
          <strong>${displayUser.nombre}</strong>
          <span>${displayUser.especialidad || 'Sin especialidad asignada'}</span>
        </div>
        ${currentUser ? '<button type="button" class="icon-btn" data-action="logout" aria-label="Cerrar sesión" title="Cerrar sesión">↪</button>' : ''}
      </div>
    `;

    container.querySelector('#sidebar-collapse-toggle').addEventListener('click', () => {
      toggleSidebarCollapsed();
    });

    container.querySelectorAll('.sidebar-link').forEach((link) => {
      link.addEventListener('click', () => {
        toggleSidebarMobile(false);
      });
    });

    container.querySelector('[data-action="logout"]')?.addEventListener('click', async () => {
      try {
        await logout();
      } catch {
        // La sesión local se elimina aunque la red no permita confirmar el cierre en servidor.
      } finally {
        appState.setState({ currentUser: null, dataReady: false });
        window.location.hash = '#/login';
      }
    });
  }

  render();
  appState.subscribe(render);
}
