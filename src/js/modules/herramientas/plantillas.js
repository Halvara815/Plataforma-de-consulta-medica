import { getLocal, setLocal } from '../../storage.js';
import { escapeHtml } from '../../utils.js';
import { icon } from '../../icons.js';
import { showToast } from '../../components/toast.js';

const STORAGE_KEY = 'herramientas_plantillas';

const DEFAULTS = [
  { id: 1, titulo: 'Nota de evolución', cuerpo: 'Paciente acude a seguimiento. Refiere...\n\nExploración física: ...\n\nPlan: ...' },
  { id: 2, titulo: 'Consentimiento informado', cuerpo: 'El paciente ha sido informado de los riesgos, beneficios y alternativas del procedimiento propuesto y otorga su consentimiento de forma voluntaria.' },
  { id: 3, titulo: 'Indicaciones generales', cuerpo: 'Reposo relativo, abundantes líquidos, dieta blanda. Acudir a revisión en caso de fiebre, dolor intenso o datos de alarma.' }
];

export function render(panelEl) {
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

  function getPlantillas() {
    const stored = getLocal(STORAGE_KEY, null);
    return stored || DEFAULTS;
  }

  function draw() {
    const plantillas = getPlantillas();
    listEl.innerHTML = plantillas.length
      ? plantillas
          .map(
            (p) => `
        <div class="tool-card">
          <div style="min-width:0; flex:1;">
            <strong style="font-size:13px;">${escapeHtml(p.titulo)}</strong>
            <p style="font-size:12.5px; white-space:pre-wrap; color:var(--text-secondary); margin-top:4px;">${escapeHtml(p.cuerpo)}</p>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <button type="button" class="btn btn-secondary btn-sm" data-copy="${p.id}">${icon('copy', { size: 13 })} Copiar</button>
            <button type="button" class="btn btn-ghost btn-sm" data-remove="${p.id}">${icon('trash', { size: 13 })}</button>
          </div>
        </div>`
          )
          .join('')
      : '<div class="empty-state">Sin plantillas guardadas.</div>';

    listEl.querySelectorAll('[data-copy]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const p = getPlantillas().find((t) => t.id === Number(btn.dataset.copy));
        try {
          await navigator.clipboard.writeText(p.cuerpo);
          showToast({ message: 'Plantilla copiada al portapapeles.', tone: 'success' });
        } catch {
          showToast({ message: 'No se pudo copiar automáticamente.', tone: 'warning' });
        }
      });
    });
    listEl.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.remove);
        setLocal(STORAGE_KEY, getPlantillas().filter((p) => p.id !== id));
        draw();
      });
    });
  }

  panelEl.querySelector('#pl-guardar').addEventListener('click', () => {
    if (!tituloInput.value.trim()) return;
    const plantillas = [...getPlantillas(), { id: Date.now(), titulo: tituloInput.value.trim(), cuerpo: cuerpoInput.value.trim() }];
    setLocal(STORAGE_KEY, plantillas);
    tituloInput.value = '';
    cuerpoInput.value = '';
    draw();
  });

  draw();
}
