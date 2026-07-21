import { getLocal, setLocal } from '../../storage.js';
import { icon } from '../../icons.js';
import { escapeHtml } from '../../utils.js';

const STORAGE_KEY = 'herramientas_favoritos';

const SHORTCUTS = [
  { id: 'nuevo-paciente', label: 'Nuevo paciente', icon: 'patients', path: '#/pacientes?action=nuevo' },
  { id: 'nueva-consulta', label: 'Nueva consulta', icon: 'stethoscope', path: '#/pacientes' },
  { id: 'nueva-receta', label: 'Nueva receta', icon: 'pill', path: '#/recetas?action=nueva' },
  { id: 'agenda', label: 'Agenda del día', icon: 'calendar', path: '#/agenda' },
  { id: 'reportes', label: 'Reportes', icon: 'reports', path: '#/reportes' },
  { id: 'documentos', label: 'Gestor de archivos', icon: 'documents', path: '#/documentos' },
  { id: 'calc-imc', label: 'Calculadora IMC', icon: 'activity', path: '#/calculadora' },
  { id: 'config', label: 'Configuración', icon: 'settings', path: '#/configuracion' }
];

export function render(panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Accesos favoritos</h2></div>
      <p class="text-tertiary" style="font-size:12px; margin-bottom:12px;">Marca los accesos que usas con más frecuencia para tenerlos siempre a la mano.</p>
      <div id="fav-grid" class="favorite-grid"></div>
    </div>
  `;

  const gridEl = panelEl.querySelector('#fav-grid');

  function getFavoritos() {
    return new Set(getLocal(STORAGE_KEY, ['nuevo-paciente', 'agenda', 'reportes']));
  }

  function draw() {
    const favoritos = getFavoritos();
    gridEl.innerHTML = SHORTCUTS.map((s) => {
      const isFav = favoritos.has(s.id);
      return `
        <div class="tool-card" style="flex-direction:column; align-items:stretch; gap:10px;">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            ${icon(s.icon, { size: 22 })}
            <button type="button" class="btn btn-ghost btn-sm" data-toggle="${s.id}" aria-label="Marcar como favorito">
              ${icon(isFav ? 'star-filled' : 'star', { size: 16 })}
            </button>
          </div>
          <strong style="font-size:13px;">${escapeHtml(s.label)}</strong>
          <a class="btn btn-secondary btn-sm" href="${s.path}">Ir</a>
        </div>
      `;
    }).join('');

    gridEl.querySelectorAll('[data-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const favs = getFavoritos();
        const id = btn.dataset.toggle;
        favs.has(id) ? favs.delete(id) : favs.add(id);
        setLocal(STORAGE_KEY, [...favs]);
        draw();
      });
    });
  }

  draw();
}
