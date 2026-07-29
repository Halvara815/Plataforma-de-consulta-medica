import { showToast } from '../../components/toast.js';
import { icon } from '../../icons.js';
import { escapeHtml, formatDate } from '../../utils.js';
import { loadPreferences, updatePreferences } from '../../services/preferencesService.js';

function newId(prefix) {
  return globalThis.crypto?.randomUUID?.() || `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function render(panelEl) {
  const preferences = await loadPreferences();
  let notas = [...preferences.notas];

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Nueva nota</h2></div>
      <div class="form-field">
        <label for="nota-titulo">Título</label>
        <input class="input" id="nota-titulo" placeholder="Ej. Pendientes de la semana" />
      </div>
      <div class="form-field" style="margin-top:10px;">
        <label for="nota-cuerpo">Contenido</label>
        <textarea class="input" id="nota-cuerpo" rows="3"></textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-primary btn-sm" id="nota-guardar">${icon('plus', { size: 14 })} Agregar nota</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Mis notas</h2></div>
      <div id="notas-list" class="stack"></div>
    </div>
  `;

  const tituloInput = panelEl.querySelector('#nota-titulo');
  const cuerpoInput = panelEl.querySelector('#nota-cuerpo');
  const listEl = panelEl.querySelector('#notas-list');

  async function save(next) {
    const previous = notas;
    notas = next;
    draw();
    try {
      notas = (await updatePreferences({ notas })).notas;
      draw();
      return true;
    } catch {
      notas = previous;
      draw();
      showToast({ message: 'No se pudo sincronizar la nota.', tone: 'warning' });
      return false;
    }
  }

  function draw() {
    listEl.innerHTML = notas.length
      ? notas
          .map(
            (nota) => `
        <div class="tool-card">
          <div style="min-width:0;">
            <strong style="font-size:13px;">${escapeHtml(nota.titulo)}</strong>
            <div class="text-tertiary" style="font-size:11px; margin:2px 0 6px;">${formatDate(nota.fecha, { withTime: true })}</div>
            <p style="font-size:13px; white-space:pre-wrap;">${escapeHtml(nota.cuerpo)}</p>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" data-remove="${nota.id}">${icon('trash', { size: 14 })}</button>
        </div>`
          )
          .join('')
      : '<div class="empty-state">Sin notas guardadas.</div>';

    listEl.querySelectorAll('[data-remove]').forEach((button) => {
      button.addEventListener('click', () => void save(notas.filter((nota) => nota.id !== button.dataset.remove)));
    });
  }

  panelEl.querySelector('#nota-guardar').addEventListener('click', async () => {
    const titulo = tituloInput.value.trim();
    if (!titulo) return;
    const saved = await save([
      { id: newId('nota'), titulo, cuerpo: cuerpoInput.value.trim(), fecha: new Date().toISOString() },
      ...notas,
    ]);
    if (saved) {
      tituloInput.value = '';
      cuerpoInput.value = '';
    }
  });

  draw();
}
