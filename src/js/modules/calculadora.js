import { setTopbarTitle } from '../components/topbar.js';
import { createSectionNav } from '../components/sectionNav.js';

import * as basica from './calculadora/basica.js';
import * as cientifica from './calculadora/cientifica.js';
import * as imc from './calculadora/imc.js';
import * as superficieCorporal from './calculadora/superficieCorporal.js';
import * as dosis from './calculadora/dosis.js';
import * as goteoIv from './calculadora/goteoIv.js';
import * as edadGestacional from './calculadora/edadGestacional.js';
import * as conversores from './calculadora/conversores.js';

const ITEMS = [
  { id: 'basica', label: 'Básica', icon: 'calculator', mod: basica },
  { id: 'cientifica', label: 'Científica', icon: 'sliders', mod: cientifica },
  { id: 'imc', label: 'IMC', icon: 'activity', mod: imc },
  { id: 'superficieCorporal', label: 'Superficie corporal', icon: 'ruler', mod: superficieCorporal },
  { id: 'dosis', label: 'Cálculo de dosis', icon: 'syringe', mod: dosis },
  { id: 'goteoIv', label: 'Goteo intravenoso', icon: 'droplets', mod: goteoIv },
  { id: 'edadGestacional', label: 'Edad gestacional', icon: 'baby', mod: edadGestacional },
  { id: 'conversores', label: 'Conversores médicos', icon: 'swap', mod: conversores }
];

let sectionNav = null;

export async function mount(container) {
  setTopbarTitle('Calculadora', 'Herramientas de cálculo clínico rápidas y confiables');

  container.innerHTML = `
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Calculadora</h1>
          <p>Calculadora básica, científica y herramientas de cálculo clínico.</p>
        </div>
      </div>
      <div id="calculadora-layout"></div>
    </div>
  `;

  sectionNav = createSectionNav({
    items: ITEMS,
    activeId: 'basica',
    ariaLabel: 'Herramientas de calculadora',
    renderPanel: (id, panelEl) => {
      const item = ITEMS.find((i) => i.id === id);
      return item.mod.render(panelEl);
    }
  });

  document.getElementById('calculadora-layout').appendChild(sectionNav.el);
}

export function unmount() {
  if (sectionNav) {
    sectionNav.destroy();
    sectionNav = null;
  }
}
