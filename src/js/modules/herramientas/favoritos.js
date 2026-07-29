import { showToast } from '../../components/toast.js';
import { icon } from '../../icons.js';
import { escapeHtml } from '../../utils.js';
import { loadPreferences, updatePreferences } from '../../services/preferencesService.js';

const SHORTCUTS = [
  { id: 'nuevo-paciente', label: 'Nuevo paciente', icon: 'patients', path: '#/pacientes?action=nuevo' },
  { id: 'nueva-consulta', label: 'Nueva consulta', icon: 'stethoscope', path: '#/pacientes' },
  { id: 'nueva-receta', label: 'Nueva receta', icon: 'pill', path: '#/recetas?action=nueva' },
  { id: 'agenda', label: 'Agenda del día', icon: 'calendar', path: '#/agenda' },
  { id: 'reportes', label: 'Reportes', icon: 'reports', path: '#/reportes' },
  { id: 'documentos', label: 'Gestor de archivos', icon: 'documents', path: '#/documentos' },
  { id: 'calc-imc', label: 'Calculadora IMC', icon: 'activity', path: '#/calculadora' },
  { id: 'config', label: 'Configuración', icon: 'settings', path: '#/configuracion' },
];

export async function render(panelEl) {
  const preferences = await loadPreferences();
  let favoritos = new Set(preferences.favoritos);

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Accesos favoritos</h2></div>
      <p class="text-tertiary" style="font-size:12px; margin-bottom:12px;">Marca los accesos que usas con más frecuencia para tenerlos siempre a la mano.</p>
      <div id="fav-grid" class="favorite-grid"></div>
    </div>
  `;

  const gridEl = panelEl.querySelector('#fav-grid');

  async function save(next) {
    const previous = favoritos;
    favoritos = next;
    draw();
    try {
      favoritos = new Set((await updatePreferences({ favoritos: [...favoritos] })).favoritos);
      draw();
    } catch {
      favoritos = previous;
      draw();
      showToast({ message: 'No se pudieron sincronizar los favoritos.', tone: 'warning' });
    }
  }

  function draw() {
    gridEl.innerHTML = SHORTCUTS.map((shortcut) => {
      const isFav = favoritos.has(shortcut.id);
      return `
        <div class="tool-card" style="flex-direction:column; align-items:stretch; gap:10px;">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            ${icon(shortcut.icon, { size: 22 })}
            <button type="button" class="btn btn-ghost btn-sm" data-toggle="${shortcut.id}" aria-label="Marcar como favorito">
              ${icon(isFav ? 'star-filled' : 'star', { size: 16 })}
            </button>
          </div>
          <strong style="font-size:13px;">${escapeHtml(shortcut.label)}</strong>
          <a class="btn btn-secondary btn-sm" href="${shortcut.path}">Ir</a>
        </div>
      `;
    }).join('');

    gridEl.querySelectorAll('[data-toggle]').forEach((button) => {
      button.addEventListener('click', () => {
        const next = new Set(favoritos);
        next.has(button.dataset.toggle) ? next.delete(button.dataset.toggle) : next.add(button.dataset.toggle);
        void save(next);
      });
    });
  }

  draw();
}
