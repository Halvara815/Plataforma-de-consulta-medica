import { navigateTo } from '../router.js';
import { toggleSidebarMobile } from '../state.js';
import { getTheme, toggleTheme } from '../theme.js';

const MOCK_NOTIFICATIONS = [
  { title: '5 resultados de laboratorio pendientes', time: 'Hace 1 hora' },
  { title: '2 interacciones medicamentosas detectadas', time: 'Hace 3 horas' },
  { title: 'Recordatorio de cita enviado a María José Hernández', time: 'Hace 5 horas' }
];

function iconSvg(path) {
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;
}

export function mountTopbar(container, { title = 'Panel General', subtitle = '' } = {}) {
  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;min-width:0;">
      <button type="button" class="icon-btn hamburger-btn" id="hamburger-toggle" aria-label="Abrir menú">
        ${iconSvg('M4 6h16M4 12h16M4 18h16')}
      </button>
      <div style="min-width:0;">
        <strong style="font-size:15px;display:block;" id="topbar-title">${title}</strong>
        ${subtitle ? `<span class="text-tertiary" style="font-size:11.5px;" id="topbar-subtitle">${subtitle}</span>` : ''}
      </div>
    </div>
    <div class="topbar-search">
      <span aria-hidden="true">🔍</span>
      <input type="search" id="topbar-search-input" placeholder="Buscar pacientes en el sistema…" aria-label="Buscar en el sistema" />
    </div>
    <div class="topbar-actions">
      <button type="button" class="icon-btn" id="theme-toggle-btn" aria-label="Cambiar tema claro/oscuro" title="Cambiar tema">
        ${iconSvg('M12 3v2m0 14v2m9-9h-2M5 12H3m14.5-6.5-1.4 1.4M6.9 17.1l-1.4 1.4m0-13 1.4 1.4M17.1 17.1l1.4 1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z')}
      </button>
      <div style="position:relative;">
        <button type="button" class="icon-btn" id="notifications-btn" aria-label="Notificaciones">
          ${iconSvg('M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0m6 0H9')}
          <span class="badge-dot">${MOCK_NOTIFICATIONS.length}</span>
        </button>
      </div>
    </div>
  `;

  container.querySelector('#hamburger-toggle').addEventListener('click', () => toggleSidebarMobile());

  container.querySelector('#theme-toggle-btn').addEventListener('click', () => {
    toggleTheme();
  });

  const searchInput = container.querySelector('#topbar-search-input');
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      navigateTo(`#/pacientes?q=${encodeURIComponent(searchInput.value.trim())}`);
    }
  });

  container.querySelector('#notifications-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const existing = document.getElementById('notifications-dropdown');
    if (existing) {
      existing.remove();
      return;
    }
    const dropdown = document.createElement('div');
    dropdown.id = 'notifications-dropdown';
    dropdown.className = 'card';
    dropdown.style.cssText =
      'position:absolute;top:56px;right:24px;width:300px;z-index:50;box-shadow:var(--shadow-lg);';
    dropdown.innerHTML = `
      <div class="card-header"><h3>Notificaciones</h3></div>
      <div class="stack">
        ${MOCK_NOTIFICATIONS.map(
          (n) => `<div><div style="font-size:13px;">${n.title}</div><div class="text-tertiary" style="font-size:11.5px;">${n.time}</div></div>`
        ).join('<hr class="divider" />')}
      </div>
    `;
    document.body.appendChild(dropdown);
    setTimeout(() => {
      document.addEventListener(
        'click',
        () => dropdown.remove(),
        { once: true }
      );
    }, 0);
  });

  updateThemeIcon();
}

function updateThemeIcon() {
  // El ícono es genérico (sol/luna combinados); el estado real se refleja en data-theme del <html>.
  const theme = getTheme();
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.title = `Tema actual: ${theme === 'system' ? 'automático' : theme}`;
}

export function setTopbarTitle(title, subtitle = '') {
  const titleEl = document.getElementById('topbar-title');
  const subtitleEl = document.getElementById('topbar-subtitle');
  if (titleEl) titleEl.textContent = title;
  if (subtitleEl) subtitleEl.textContent = subtitle;
}
