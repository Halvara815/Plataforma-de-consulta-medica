import { appState, toggleSidebarCollapsed, toggleSidebarMobile } from '../state.js';
import { initials } from '../utils.js';

const NAV_ITEMS = [
  { route: 'dashboard', path: '#/dashboard', label: 'Dashboard', icon: 'M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z' },
  { route: 'pacientes', path: '#/pacientes', label: 'Pacientes', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0v1H5v-1Z' },
  { route: 'historiaClinica', path: '#/pacientes', label: 'Historia Clínica', icon: 'M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm8 8H8v2h6v-2Zm2 4H8v2h8v-2Z' },
  { route: 'agenda', path: '#/agenda', label: 'Citas / Agenda', icon: 'M7 2v3M17 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z' },
  { route: 'recetas', path: '#/recetas', label: 'Prescripciones', icon: 'M9 2h6l1 4h3v2h-1.2l-1.6 12.2A2 2 0 0 1 14.2 22H9.8a2 2 0 0 1-2-1.8L6.2 8H5V6h3l1-4Zm0 8v8m3-8v8m3-8v8' },
  { route: 'documentos', path: '#/documentos', label: 'Imágenes / Documentos', icon: 'M4 4h11l5 5v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm3 9 2.5 3L13 12l4 6H7l0-5Z' },
  { route: 'reportes', path: '#/reportes', label: 'Reportes', icon: 'M4 20V10m6 10V4m6 16v-7' },
  { route: 'configuracion', path: '#/configuracion', label: 'Configuración', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.2-1.8l2-1.6-2-3.4-2.4 1a8 8 0 0 0-3.1-1.8L14 2h-4l-.3 2.4a8 8 0 0 0-3.1 1.8l-2.4-1-2 3.4 2 1.6A8 8 0 0 0 4 12c0 .6.1 1.2.2 1.8l-2 1.6 2 3.4 2.4-1a8 8 0 0 0 3.1 1.8L10 22h4l.3-2.4a8 8 0 0 0 3.1-1.8l2.4 1 2-3.4-2-1.6c.1-.6.2-1.2.2-1.8Z' }
];

function iconSvg(path) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;
}

export function mountSidebar(container) {
  function render() {
    const { route, currentUser, sidebarCollapsed } = appState.getState();
    const activeName = route?.name;

    container.innerHTML = `
      <div class="sidebar-brand">
        <span class="sidebar-brand-icon">${iconSvg('M12 21s-7.5-4.6-10-9.3C.4 8.1 2 4.5 5.6 4c2-.3 3.7.7 4.9 2.2C11.7 4.7 13.4 3.7 15.4 4c3.6.5 5.2 4.1 3.6 7.7C16.5 16.4 12 21 12 21Z')}</span>
        <div class="sidebar-brand-text">
          <strong>Consulta Práctica</strong>
          <span>EMR / EHR · Demo local</span>
        </div>
      </div>
      <nav class="sidebar-nav" aria-label="Navegación principal">
        ${NAV_ITEMS.map(
          (item) => `
          <a class="sidebar-link${item.route === activeName ? ' is-active' : ''}" href="${item.path}" data-route="${item.route}">
            ${iconSvg(item.icon)}
            <span class="label">${item.label}</span>
          </a>`
        ).join('')}
      </nav>
      <button type="button" class="sidebar-collapse-btn" id="sidebar-collapse-toggle" aria-label="Colapsar barra lateral">
        ${iconSvg(sidebarCollapsed ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6')}
        <span class="label">${sidebarCollapsed ? 'Expandir' : 'Colapsar'}</span>
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
