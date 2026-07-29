import { showToast } from '../../components/toast.js';
import { icon } from '../../icons.js';
import { escapeHtml } from '../../utils.js';
import { loadPreferences, updatePreferences } from '../../services/preferencesService.js';

function newId(prefix) {
  return globalThis.crypto?.randomUUID?.() || `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function render(panelEl) {
  const preferences = await loadPreferences();
  let plantillas = [...preferences.plantillas];

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Nueva plantilla</h2></div>
      <div class="form-field">
        <label for="pl-titulo">Título</label>
        <input class="input" id="pl-titulo" placeholder="Ej. Receta estándar" />
      </div>
      <div class="form-field" style="margin-top:10px;">
        <label for="pl-cuerpo">Contenido</label>
        <textarea class="input" id="pl-cuerpo" rows="4"></textarea>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-primary btn-sm" id="pl-guardar">${icon('plus', { size: 14 })} Guardar plantilla</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Plantillas médicas</h2></div>
      <div id="pl-list" class="stack"></div>
    </div>
  `;

  const tituloInput = panelEl.querySelector('#pl-titulo');
  const cuerpoInput = panelEl.querySelector('#pl-cuerpo');
  const listEl = panelEl.querySelector('#pl-list');

  async function save(next) {
    const previous = plantillas;
    plantillas = next;
    draw();
    try {
      plantillas = (await updatePreferences({ plantillas })).plantillas;
      draw();
      return true;
    } catch {
      plantillas = previous;
      draw();
      showToast({ message: 'No se pudo sincronizar la plantilla.', tone: 'warning' });
      return false;
    }
  }

  function draw() {
    listEl.innerHTML = plantillas.length
      ? plantillas
          .map(
            (plantilla) => `
        <div class="tool-card">
          <div style="min-width:0; flex:1;">
            <strong style="font-size:13px;">${escapeHtml(plantilla.titulo)}</strong>
            <p style="font-size:12.5px; white-space:pre-wrap; color:var(--text-secondary); margin-top:4px;">${escapeHtml(plantilla.cuerpo)}</p>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <button type="button" class="btn btn-secondary btn-sm" data-copy="${plantilla.id}">${icon('copy', { size: 13 })} Copiar</button>
            <button type="button" class="btn btn-ghost btn-sm" data-remove="${plantilla.id}">${icon('trash', { size: 13 })}</button>
          </div>
        </div>`
          )
          .join('')
      : '<div class="empty-state">Sin plantillas guardadas.</div>';

    listEl.querySelectorAll('[data-copy]').forEach((button) => {
      button.addEventListener('click', async () => {
        const plantilla = plantillas.find((item) => item.id === button.dataset.copy);
        if (!plantilla) return;
        try {
          await navigator.clipboard.writeText(plantilla.cuerpo);
          showToast({ message: 'Plantilla copiada al portapapeles.', tone: 'success' });
        } catch {
          showToast({ message: 'No se pudo copiar automáticamente.', tone: 'warning' });
        }
      });
    });
    listEl.querySelectorAll('[data-remove]').forEach((button) => {
      button.addEventListener('click', () => void save(plantillas.filter((plantilla) => plantilla.id !== button.dataset.remove)));
    });
  }

  panelEl.querySelector('#pl-guardar').addEventListener('click', async () => {
    const titulo = tituloInput.value.trim();
    const cuerpo = cuerpoInput.value.trim();
    if (!titulo || !cuerpo) return;
    const saved = await save([...plantillas, { id: newId('plantilla'), titulo, cuerpo }]);
    if (saved) {
      tituloInput.value = '';
      cuerpoInput.value = '';
    }
  });

  draw();
}
