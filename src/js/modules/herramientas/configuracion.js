import { showToast } from '../../components/toast.js';
import { icon } from '../../icons.js';
import { getPreferencesSnapshot, loadPreferences, resetHerramientas, updatePreferences } from '../../services/preferencesService.js';

export function getHerramientasConfig() {
  return { sonidoTemporizador: getPreferencesSnapshot().sonidoTemporizador };
}

export async function render(panelEl) {
  const config = await loadPreferences();

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Preferencias</h2></div>
      <label class="checkbox-row">
        <input type="checkbox" id="cfg-sonido" ${config.sonidoTemporizador ? 'checked' : ''} />
        Reproducir sonido al finalizar el temporizador
      </label>
    </div>
    <div class="card">
      <div class="card-header"><h2>Datos de Herramientas</h2></div>
      <p style="font-size:13px;">Notas, recordatorios, plantillas, favoritos y firmas se sincronizan de forma privada con tu cuenta.</p>
      <div class="form-actions">
        <button type="button" class="btn btn-danger btn-sm" id="cfg-limpiar">${icon('trash', { size: 14 })} Restablecer datos de Herramientas</button>
      </div>
    </div>
  `;

  panelEl.querySelector('#cfg-sonido').addEventListener('change', async (event) => {
    const input = event.target;
    try {
      await updatePreferences({ sonidoTemporizador: input.checked });
      showToast({ message: 'Preferencia sincronizada.', tone: 'success' });
    } catch {
      input.checked = !input.checked;
      showToast({ message: 'No se pudo guardar la preferencia.', tone: 'warning' });
    }
  });

  panelEl.querySelector('#cfg-limpiar').addEventListener('click', async () => {
    if (!confirm('Esto eliminará tus notas, recordatorios, plantillas, favoritos y firmas guardadas. ¿Continuar?')) return;
    try {
      await resetHerramientas();
      showToast({ message: 'Datos de Herramientas restablecidos.', tone: 'success' });
      void render(panelEl);
    } catch {
      showToast({ message: 'No se pudieron restablecer los datos.', tone: 'warning' });
    }
  });
}
