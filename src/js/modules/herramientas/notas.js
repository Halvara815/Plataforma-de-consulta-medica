import { getLocal, setLocal } from '../../storage.js';
import { escapeHtml, formatDate } from '../../utils.js';
import { icon } from '../../icons.js';

const STORAGE_KEY = 'herramientas_notas';

export function render(panelEl) {
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

  function draw() {
    const notas = getLocal(STORAGE_KEY, []);
    listEl.innerHTML = notas.length
      ? notas
          .map(
            (n) => `
        <div class="tool-card">
          <div style="min-width:0;">
            <strong style="font-size:13px;">${escapeHtml(n.titulo)}</strong>
            <div class="text-tertiary" style="font-size:11px; margin:2px 0 6px;">${formatDate(n.fecha, { withTime: true })}</div>
            <p style="font-size:13px; white-space:pre-wrap;">${escapeHtml(n.cuerpo)}</p>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" data-remove="${n.id}">${icon('trash', { size: 14 })}</button>
        </div>`
          )
          .join('')
      : '<div class="empty-state">Sin notas guardadas.</div>';

    listEl.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.remove);
        setLocal(STORAGE_KEY, getLocal(STORAGE_KEY, []).filter((n) => n.id !== id));
        draw();
      });
    });
  }

  panelEl.querySelector('#nota-guardar').addEventListener('click', () => {
    if (!tituloInput.value.trim()) return;
    const notas = getLocal(STORAGE_KEY, []);
    notas.unshift({ id: Date.now(), titulo: tituloInput.value.trim(), cuerpo: cuerpoInput.value.trim(), fecha: new Date().toISOString() });
    setLocal(STORAGE_KEY, notas);
    tituloInput.value = '';
    cuerpoInput.value = '';
    draw();
  });

  draw();
}
