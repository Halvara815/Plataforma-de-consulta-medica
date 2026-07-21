import { mountCalculator } from './calcKeypad.js';

export function render(panelEl) {
  mountCalculator(panelEl, { scientific: false });
}
