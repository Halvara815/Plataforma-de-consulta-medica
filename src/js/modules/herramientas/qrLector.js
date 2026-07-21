import { mountScanner } from './scannerBase.js';

export function render(panelEl) {
  return mountScanner(panelEl, {
    title: 'Lector de código QR',
    formats: ['QR_CODE'],
    hint: 'Apunta la cámara hacia un código QR para decodificarlo automáticamente.'
  });
}
