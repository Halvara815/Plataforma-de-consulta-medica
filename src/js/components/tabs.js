import { escapeHtml } from '../utils.js';

/**
 * Componente de pestañas reutilizado por Historia Clínica y Consulta.
 * onChange(tabId) se invoca al hacer clic; el llamador re-renderiza el panel activo.
 */
export function createTabs({ tabs, activeId, onChange, panelHtml }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'tabs-wrapper';
  render();

  function render() {
    const tabsHtml = tabs
      .map(
        (tab) =>
          `<button type="button" class="tab-btn${tab.id === activeId ? ' is-active' : ''}" data-tab="${tab.id}" role="tab" aria-selected="${tab.id === activeId}">${escapeHtml(tab.label)}</button>`
      )
      .join('');
    wrapper.innerHTML = `
      <div class="tabs" role="tablist">${tabsHtml}</div>
      <div class="tab-panel" role="tabpanel">${panelHtml(activeId)}</div>
    `;
    wrapper.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.tab === activeId) return;
        activeId = btn.dataset.tab;
        if (onChange) onChange(activeId);
        render();
      });
    });
  }

  return {
    el: wrapper,
    setActive(id) {
      activeId = id;
      render();
    }
  };
}
