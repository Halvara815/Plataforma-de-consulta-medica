import { appState } from '../state.js';
import { getTheme, setTheme } from '../theme.js';
import { setTopbarTitle } from '../components/topbar.js';
import { cardHtml } from '../components/card.js';
import { resetDemoData } from '../services/dataService.js';
import { idbExportAll, idbBulkPut, isIndexedDbAvailable, STORES } from '../storage.js';

let cleanupFns = [];

export async function mount(container) {
  setTopbarTitle('Configuración', 'Preferencias de interfaz, respaldo local y datos de la demo');

  const { currentUser } = appState.getState();
  const theme = getTheme();

  container.innerHTML = `
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Configuración</h1>
          <p>Preferencias de interfaz, respaldo local y datos de la demo</p>
        </div>
      </div>

      <div class="two-col">
        <div class="stack">
          ${cardHtml({
            title: 'Apariencia',
            bodyHtml: `
              <div class="radio-group" id="theme-options" style="flex-direction:column; align-items:flex-start; gap:10px;">
                ${[
                  { value: 'light', label: 'Claro' },
                  { value: 'dark', label: 'Oscuro' },
                  { value: 'system', label: 'Automático (según el sistema)' }
                ]
                  .map(
                    (opt) => `
                    <label class="radio-option">
                      <input type="radio" name="theme" value="${opt.value}" ${theme === opt.value ? 'checked' : ''} />
                      ${opt.label}
                    </label>
                  `
                  )
                  .join('')}
              </div>
              <p class="text-tertiary" style="font-size:12px; margin-top:10px;">Esta preferencia se guarda en localStorage de tu navegador (solo afecta la interfaz).</p>
            `
          })}

          ${cardHtml({
            title: 'Perfil del médico (demo)',
            bodyHtml: `
              <div class="info-grid">
                <div class="info-item"><div class="info-label">Nombre</div><div class="info-value">${currentUser.nombre}</div></div>
                <div class="info-item"><div class="info-label">Especialidad</div><div class="info-value">${currentUser.especialidad}</div></div>
                <div class="info-item"><div class="info-label">Cédula</div><div class="info-value">${currentUser.cedula}</div></div>
                <div class="info-item"><div class="info-label">Estado</div><div class="info-value">${currentUser.estado}</div></div>
              </div>
              <p class="text-tertiary" style="font-size:12px; margin-top:10px;">La edición de perfil de usuario real se habilitará en la fase de producción con autenticación (ver Ruta a producción).</p>
            `
          })}
        </div>

        <div class="stack">
          ${cardHtml({
            title: 'Respaldo / Configuración de datos',
            bodyHtml: `
              <p style="font-size:13px;">
                Esta fase no usa base de datos real. Las altas y ediciones que hagas (pacientes, citas, consultas, recetas,
                documentos y estudios) se guardan localmente en <strong>IndexedDB</strong> de este navegador
                ${isIndexedDbAvailable() ? '' : ' — IndexedDB no está disponible en este navegador, así que los cambios no persistirán entre recargas.'}.
              </p>
              <div class="view-actions" style="margin-top:12px;">
                <button type="button" class="btn btn-secondary" id="btn-exportar">⬇ Exportar respaldo (JSON)</button>
                <label class="btn btn-secondary" for="input-importar" style="cursor:pointer;">⬆ Importar respaldo
                  <input type="file" id="input-importar" accept="application/json" style="display:none;" />
                </label>
                <button type="button" class="btn btn-danger" id="btn-reset">↺ Restablecer datos demo</button>
              </div>
              <div id="respaldo-status" class="text-tertiary" style="font-size:12px; margin-top:8px;"></div>
            `
          })}

          ${cardHtml({
            title: 'Ruta a producción',
            bodyHtml: `
              <p style="font-size:13px;">
                Esta demo corre 100% en el navegador con datos ficticios. La segunda etapa (backend real, base de datos,
                autenticación, auditoría e interoperabilidad HL7 FHIR / DICOMweb) está documentada en
                <code>docs/PRODUCTION_ROADMAP.md</code> dentro del repositorio.
              </p>
            `
          })}
        </div>
      </div>
    </div>
  `;

  document.getElementById('theme-options').addEventListener('change', (e) => {
    if (e.target.name === 'theme') setTheme(e.target.value);
  });

  document.getElementById('btn-exportar').addEventListener('click', async () => {
    const data = await idbExportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respaldo-demo-consulta-practica-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Respaldo exportado.');
  });

  document.getElementById('input-importar').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      for (const storeName of STORES) {
        if (Array.isArray(data[storeName]) && data[storeName].length) {
          await idbBulkPut(storeName, data[storeName]);
        }
      }
      setStatus('Respaldo importado. Recargando…');
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      console.error(err);
      setStatus('No se pudo importar el archivo. Verifica que sea un respaldo JSON válido.');
    }
  });

  document.getElementById('btn-reset').addEventListener('click', async () => {
    if (!confirm('Esto eliminará todos los cambios locales (altas y ediciones) y volverá a los datos originales de la demo. ¿Continuar?')) return;
    await resetDemoData();
    setStatus('Datos restablecidos. Recargando…');
    setTimeout(() => window.location.reload(), 500);
  });
}

function setStatus(message) {
  const el = document.getElementById('respaldo-status');
  if (el) el.textContent = message;
}

export function unmount() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
}
