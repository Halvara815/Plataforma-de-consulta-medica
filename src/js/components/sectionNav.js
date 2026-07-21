import { escapeHtml } from '../utils.js';
import { icon } from '../icons.js';

/**
 * Navegación seccional vertical (ícono + etiqueta) reutilizada por el panel de
 * Pacientes y por los módulos Calculadora y Herramientas para que las tres
 * superficies compartan exactamente el mismo diseño y comportamiento.
 *
 * renderPanel(id, panelEl) puebla panelEl y puede devolver una función de limpieza
 * (por ejemplo para detener cámara/micrófono) que se invoca al cambiar de sección
 * o al llamar a destroy().
 */
export function createSectionNav({ items, activeId, renderPanel, ariaLabel = 'Navegación de sección' }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'section-nav-layout';

  const nav = document.createElement('nav');
  nav.className = 'section-nav';
  nav.setAttribute('aria-label', ariaLabel);

  const panel = document.createElement('div');
  panel.className = 'section-nav-panel';

  wrapper.appendChild(nav);
  wrapper.appendChild(panel);

  let current = items.some((i) => i.id === activeId) ? activeId : items[0]?.id;
  let panelCleanup = null;

  function renderNav() {
    nav.innerHTML = items
      .map(
        (item) => `
        <button type="button" class="section-nav-item${item.id === current ? ' is-active' : ''}" data-section="${item.id}" title="${escapeHtml(item.label)}">
          ${icon(item.icon || 'file', { size: 19 })}
          <span class="label">${escapeHtml(item.label)}</span>
        </button>`
      )
      .join('');

    nav.querySelectorAll('[data-section]').forEach((btn) => {
      btn.addEventListener('click', () => setActive(btn.dataset.section));
    });
  }

  function renderCurrentPanel() {
    if (typeof panelCleanup === 'function') {
      try {
        panelCleanup();
      } catch (err) {
        console.error('Error al limpiar la sección anterior', err);
      }
    }
    panelCleanup = null;
    panel.innerHTML = '';
    const result = renderPanel(current, panel);
    if (typeof result === 'function') panelCleanup = result;
  }

  function setActive(id) {
    if (id === current) return;
    current = id;
    nav.querySelectorAll('[data-section]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.section === current);
    });
    renderCurrentPanel();
  }

  renderNav();
  renderCurrentPanel();

  return {
    el: wrapper,
    setActive,
    getActive: () => current,
    destroy() {
      if (typeof panelCleanup === 'function') {
        try {
          panelCleanup();
        } catch (err) {
          console.error('Error al limpiar la sección activa', err);
        }
      }
      panelCleanup = null;
    }
  };
}
