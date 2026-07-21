import { appState, toggleSidebarCollapsed, toggleSidebarMobile } from '../state.js';
import { initials } from '../utils.js';
import { icon } from '../icons.js';

const NAV_ITEMS = [
  { route: 'dashboard', path: '#/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { route: 'pacientes', path: '#/pacientes', label: 'Pacientes', icon: 'patients' },
  { route: 'historiaClinica', path: '#/pacientes', label: 'Historia Clínica', icon: 'history' },
  { route: 'agenda', path: '#/agenda', label: 'Citas / Agenda', icon: 'calendar' },
  { route: 'recetas', path: '#/recetas', label: 'Prescripciones', icon: 'pill' },
  { route: 'documentos', path: '#/documentos', label: 'Imágenes / Documentos', icon: 'documents' },
  { route: 'reportes', path: '#/reportes', label: 'Reportes', icon: 'reports' },
  { route: 'calculadora', path: '#/calculadora', label: 'Calculadora', icon: 'calculator' },
  { route: 'herramientas', path: '#/herramientas', label: 'Herramientas', icon: 'wrench' },
  { route: 'configuracion', path: '#/configuracion', label: 'Configuración', icon: 'settings' }
];

export function mountSidebar(container) {
  function render() {
    const { route, currentUser, sidebarCollapsed } = appState.getState();
    const activeName = route?.name;

    container.innerHTML = `
      <div class="sidebar-brand">
        <span class="sidebar-brand-icon">${icon('heart', { size: 20 })}</span>
        <div class="sidebar-brand-text">
          <strong>Consulta Práctica</strong>
          <span>EMR / EHR · Demo local</span>
        </div>
      </div>
      <nav class="sidebar-nav" aria-label="Navegación principal">
        ${NAV_ITEMS.map(
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
        <span class="sidebar-footer-avatar">${initials(currentUser.nombre)}</span>
        <div class="sidebar-footer-text">
          <strong>${currentUser.nombre}</strong>
          <span>${currentUser.especialidad}</span>
        </div>
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
  }

  render();
  appState.subscribe(render);
}
