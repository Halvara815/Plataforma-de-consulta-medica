import { setTopbarTitle } from '../components/topbar.js';
import { createSectionNav } from '../components/sectionNav.js';

import * as notas from './herramientas/notas.js';
import * as agenda from './herramientas/agenda.js';
import * as calendario from './herramientas/calendario.js';
import * as cronometro from './herramientas/cronometro.js';
import * as temporizador from './herramientas/temporizador.js';
import * as qrGenerador from './herramientas/qrGenerador.js';
import * as qrLector from './herramientas/qrLector.js';
import * as codigoBarras from './herramientas/codigoBarras.js';
import * as capturaPantalla from './herramientas/capturaPantalla.js';
import * as grabadoraVoz from './herramientas/grabadoraVoz.js';
import * as firmaDigital from './herramientas/firmaDigital.js';
import * as plantillas from './herramientas/plantillas.js';
import * as favoritos from './herramientas/favoritos.js';
import * as configuracion from './herramientas/configuracion.js';

const ITEMS = [
  { id: 'notas', label: 'Bloc de notas', icon: 'note', mod: notas },
  { id: 'agenda', label: 'Agenda personal', icon: 'clipboard-list', mod: agenda },
  { id: 'calendario', label: 'Calendario', icon: 'calendar', mod: calendario },
  { id: 'cronometro', label: 'Cronómetro', icon: 'stopwatch', mod: cronometro },
  { id: 'temporizador', label: 'Temporizador', icon: 'timer', mod: temporizador },
  { id: 'qrGenerador', label: 'Generador QR', icon: 'qr-code', mod: qrGenerador },
  { id: 'qrLector', label: 'Lector QR', icon: 'camera', mod: qrLector },
  { id: 'codigoBarras', label: 'Lector de código de barras', icon: 'barcode', mod: codigoBarras },
  { id: 'capturaPantalla', label: 'Captura de pantalla', icon: 'screen', mod: capturaPantalla },
  { id: 'grabadoraVoz', label: 'Grabadora de voz', icon: 'mic', mod: grabadoraVoz },
  { id: 'firmaDigital', label: 'Firma digital', icon: 'pen-tool', mod: firmaDigital },
  { id: 'plantillas', label: 'Plantillas médicas', icon: 'layout', mod: plantillas },
  { id: 'favoritos', label: 'Favoritos', icon: 'star', mod: favoritos },
  { id: 'configuracion', label: 'Configuración', icon: 'settings', mod: configuracion }
];

let sectionNav = null;

export async function mount(container) {
  setTopbarTitle('Herramientas', 'Utilidades de productividad y captura para la consulta diaria');

  container.innerHTML = `
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Herramientas</h1>
          <p>Utilidades rápidas: notas, agenda, códigos QR/barras, captura, grabación, firma y más.</p>
        </div>
      </div>
      <div id="herramientas-layout"></div>
    </div>
  `;

  sectionNav = createSectionNav({
    items: ITEMS,
    activeId: 'notas',
    ariaLabel: 'Herramientas disponibles',
    renderPanel: (id, panelEl) => {
      const item = ITEMS.find((i) => i.id === id);
      return item.mod.render(panelEl);
    }
  });

  document.getElementById('herramientas-layout').appendChild(sectionNav.el);
}

export function unmount() {
  if (sectionNav) {
    sectionNav.destroy();
    sectionNav = null;
  }
}
