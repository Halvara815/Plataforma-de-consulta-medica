import { getLocal, setLocal } from '../../storage.js';
import { escapeHtml, formatDate } from '../../utils.js';
import { icon } from '../../icons.js';

const STORAGE_KEY = 'herramientas_agenda_personal';

export function render(panelEl) {
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

  function draw() {
    const items = [...getLocal(STORAGE_KEY, [])].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    listEl.innerHTML = items.length
      ? items
          .map(
            (r) => `
        <div style="display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid var(--border-color);">
          <input type="checkbox" data-toggle="${r.id}" ${r.done ? 'checked' : ''} />
          <div style="flex:1; ${r.done ? 'text-decoration:line-through; color:var(--text-tertiary);' : ''}">
            <div style="font-size:13px; font-weight:600;">${escapeHtml(r.titulo)}</div>
            <div class="text-tertiary" style="font-size:11.5px;">${formatDate(r.fecha)}</div>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" data-remove="${r.id}">${icon('trash', { size: 14 })}</button>
        </div>`
          )
          .join('')
      : '<div class="empty-state">Sin recordatorios pendientes.</div>';

    listEl.querySelectorAll('[data-toggle]').forEach((el) => {
      el.addEventListener('change', () => {
        const id = Number(el.dataset.toggle);
        const items = getLocal(STORAGE_KEY, []).map((r) => (r.id === id ? { ...r, done: el.checked } : r));
        setLocal(STORAGE_KEY, items);
        draw();
      });
    });
    listEl.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.remove);
        setLocal(STORAGE_KEY, getLocal(STORAGE_KEY, []).filter((r) => r.id !== id));
        draw();
      });
    });
  }

  panelEl.querySelector('#ag-guardar').addEventListener('click', () => {
    if (!tituloInput.value.trim()) return;
    const items = getLocal(STORAGE_KEY, []);
    items.push({ id: Date.now(), titulo: tituloInput.value.trim(), fecha: fechaInput.value, done: false });
    setLocal(STORAGE_KEY, items);
    tituloInput.value = '';
    draw();
  });

  draw();
}
