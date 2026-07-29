import { showToast } from '../../components/toast.js';
import { icon } from '../../icons.js';
import { escapeHtml, formatDate } from '../../utils.js';
import { loadPreferences, updatePreferences } from '../../services/preferencesService.js';

function newId(prefix) {
  return globalThis.crypto?.randomUUID?.() || `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function render(panelEl) {
  const preferences = await loadPreferences();
  let recordatorios = [...preferences.recordatorios];

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Nuevo recordatorio personal</h2></div>
      <p class="text-tertiary" style="font-size:12px; margin-bottom:10px;">Recordatorios rápidos para ti; distintos de la agenda clínica de citas con pacientes.</p>
      <div class="form-grid">
        <div class="form-field span-2">
          <label for="ag-titulo">Recordatorio</label>
          <input class="input" id="ag-titulo" placeholder="Ej. Llamar al laboratorio" />
        </div>
        <div class="form-field">
          <label for="ag-fecha">Fecha</label>
          <input class="input" type="date" id="ag-fecha" />
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-primary btn-sm" id="ag-guardar">${icon('plus', { size: 14 })} Agregar</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Mis recordatorios</h2></div>
      <div id="ag-list" class="stack" style="gap:0;"></div>
    </div>
  `;

  const tituloInput = panelEl.querySelector('#ag-titulo');
  const fechaInput = panelEl.querySelector('#ag-fecha');
  const listEl = panelEl.querySelector('#ag-list');
  fechaInput.value = new Date().toISOString().slice(0, 10);

  async function save(next) {
    const previous = recordatorios;
    recordatorios = next;
    draw();
    try {
      recordatorios = (await updatePreferences({ recordatorios })).recordatorios;
      draw();
      return true;
    } catch {
      recordatorios = previous;
      draw();
      showToast({ message: 'No se pudo sincronizar el recordatorio.', tone: 'warning' });
      return false;
    }
  }

  function draw() {
    const items = [...recordatorios].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    listEl.innerHTML = items.length
      ? items
          .map(
            (recordatorio) => `
        <div style="display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid var(--border-color);">
          <input type="checkbox" data-toggle="${recordatorio.id}" ${recordatorio.done ? 'checked' : ''} />
          <div style="flex:1; ${recordatorio.done ? 'text-decoration:line-through; color:var(--text-tertiary);' : ''}">
            <div style="font-size:13px; font-weight:600;">${escapeHtml(recordatorio.titulo)}</div>
            <div class="text-tertiary" style="font-size:11.5px;">${formatDate(recordatorio.fecha)}</div>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" data-remove="${recordatorio.id}">${icon('trash', { size: 14 })}</button>
        </div>`
          )
          .join('')
      : '<div class="empty-state">Sin recordatorios pendientes.</div>';

    listEl.querySelectorAll('[data-toggle]').forEach((input) => {
      input.addEventListener('change', () => {
        const id = input.dataset.toggle;
        void save(recordatorios.map((recordatorio) => (recordatorio.id === id ? { ...recordatorio, done: input.checked } : recordatorio)));
      });
    });
    listEl.querySelectorAll('[data-remove]').forEach((button) => {
      button.addEventListener('click', () => void save(recordatorios.filter((recordatorio) => recordatorio.id !== button.dataset.remove)));
    });
  }

  panelEl.querySelector('#ag-guardar').addEventListener('click', async () => {
    const titulo = tituloInput.value.trim();
    if (!titulo || !fechaInput.value) return;
    const saved = await save([
      ...recordatorios,
      { id: newId('recordatorio'), titulo, fecha: fechaInput.value, done: false },
    ]);
    if (saved) tituloInput.value = '';
  });

  draw();
}
