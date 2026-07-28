import { appState } from '../state.js';
import { getTheme, setTheme } from '../theme.js';
import { setTopbarTitle } from '../components/topbar.js';
import { cardHtml } from '../components/card.js';
import { resetDemoData } from '../services/dataService.js';
import { icon } from '../icons.js';

let cleanupFns = [];

export async function mount(container) {
  setTopbarTitle('Configuración', 'Preferencias de interfaz y sincronización de datos');

  const { currentUser } = appState.getState();
  const theme = getTheme();

  container.innerHTML = `
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Configuración</h1>
          <p>Preferencias de interfaz y sincronización de datos</p>
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
              <p class="text-tertiary" style="font-size:12px; margin-top:10px;">Esta preferencia se guarda en el dispositivo local (solo afecta la interfaz).</p>
            `
          })}

          ${cardHtml({
            title: 'Perfil del médico',
            bodyHtml: `
              <div class="info-grid">
                <div class="info-item"><div class="info-label">Nombre</div><div class="info-value">${currentUser.nombre}</div></div>
                <div class="info-item"><div class="info-label">Especialidad</div><div class="info-value">${currentUser.especialidad}</div></div>
                <div class="info-item"><div class="info-label">Cédula</div><div class="info-value">${currentUser.cedula}</div></div>
                <div class="info-item"><div class="info-label">Estado</div><div class="info-value">${currentUser.estado}</div></div>
              </div>
            `
          })}
        </div>

        <div class="stack">
          ${cardHtml({
            title: 'Sincronización de datos (Backend)',
            bodyHtml: `
              <p style="font-size:13px;">
                El sistema ahora se comunica directamente con la API en <strong>localhost:3000</strong>. Todos los datos (pacientes, citas, consultas) se respaldan automáticamente de forma centralizada en la base de datos (PostgreSQL).
              </p>
              <div class="view-actions" style="margin-top:12px;">
                <button type="button" class="btn btn-danger" id="btn-reset">${icon('refresh', { size: 14 })} Cerrar Sesión Segura</button>
              </div>
              <div id="respaldo-status" class="text-tertiary" style="font-size:12px; margin-top:8px;"></div>
            `
          })}

          ${cardHtml({
            title: 'Ruta a producción',
            bodyHtml: `
              <p style="font-size:13px;">
                La segunda etapa (backend real, base de datos,
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

  document.getElementById('btn-reset').addEventListener('click', async () => {
    if (!confirm('¿Estás seguro de que deseas cerrar sesión? Tendrás que volver a ingresar tu JWT.')) return;
    await resetDemoData();
    setStatus('Sesión cerrada. Redirigiendo...');
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

