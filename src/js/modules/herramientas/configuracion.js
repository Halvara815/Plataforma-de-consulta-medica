import { getLocal, setLocal } from '../../storage.js';
import { showToast } from '../../components/toast.js';
import { icon } from '../../icons.js';

const CONFIG_KEY = 'herramientas_config';
const DATA_KEYS = [
  'herramientas_notas',
  'herramientas_agenda_personal',
  'herramientas_plantillas',
  'herramientas_favoritos',
  'herramientas_firmas'
];

export function getHerramientasConfig() {
  return getLocal(CONFIG_KEY, { sonidoTemporizador: true });
}

export function render(panelEl) {
  const config = getHerramientasConfig();

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Preferencias</h2></div>
      <label class="checkbox-row">
        <input type="checkbox" id="cfg-sonido" ${config.sonidoTemporizador ? 'checked' : ''} />
        Reproducir sonido al finalizar el temporizador
      </label>
    </div>
    <div class="card">
      <div class="card-header"><h2>Datos locales de Herramientas</h2></div>
      <p style="font-size:13px;">Notas, recordatorios, plantillas, favoritos y firmas guardadas se almacenan únicamente en este navegador (localStorage).</p>
      <div class="form-actions">
        <button type="button" class="btn btn-danger btn-sm" id="cfg-limpiar">${icon('trash', { size: 14 })} Borrar datos locales de Herramientas</button>
      </div>
    </div>
  `;

  panelEl.querySelector('#cfg-sonido').addEventListener('change', (e) => {
    setLocal(CONFIG_KEY, { ...getHerramientasConfig(), sonidoTemporizador: e.target.checked });
  });

  panelEl.querySelector('#cfg-limpiar').addEventListener('click', () => {
    if (!confirm('Esto eliminará notas, recordatorios, plantillas, favoritos y firmas guardadas de Herramientas en este navegador. ¿Continuar?')) return;
    DATA_KEYS.forEach((key) => setLocal(key, []));
    showToast({ message: 'Datos locales de Herramientas eliminados.', tone: 'success' });
  });
}
