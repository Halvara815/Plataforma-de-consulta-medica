import { mountScanner } from './scannerBase.js';

export function render(panelEl) {
  return mountScanner(panelEl, {
    title: 'Lector de código de barras',
    formats: ['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'CODE_128', 'CODE_39', 'ITF', 'CODABAR'],
    hint: 'Apunta la cámara hacia un código de barras (EAN, UPC, Code 128, Code 39) para decodificarlo.'
  });
}
