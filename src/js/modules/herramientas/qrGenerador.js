import QRCode from 'qrcode';
import { icon } from '../../icons.js';
import { downloadBlob } from '../../utils.js';
import { showToast } from '../../components/toast.js';

export function render(panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Generador de código QR</h2></div>
      <div class="form-field">
        <label for="qr-texto">Texto, URL o datos a codificar</label>
        <textarea class="input" id="qr-texto" rows="3" placeholder="https://ejemplo.com o cualquier texto"></textarea>
      </div>
      <div style="display:flex; flex-direction:column; align-items:center; gap:12px; margin-top:16px;">
        <canvas id="qr-canvas"></canvas>
        <button type="button" class="btn btn-secondary btn-sm" id="qr-download" disabled>${icon('download', { size: 14 })} Descargar PNG</button>
      </div>
    </div>
  `;

  const textoInput = panelEl.querySelector('#qr-texto');
  const canvas = panelEl.querySelector('#qr-canvas');
  const downloadBtn = panelEl.querySelector('#qr-download');

  async function generar() {
    const texto = textoInput.value.trim();
    if (!texto) {
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      downloadBtn.disabled = true;
      return;
    }
    try {
      await QRCode.toCanvas(canvas, texto, { width: 220, margin: 1 });
      downloadBtn.disabled = false;
    } catch (err) {
      console.error(err);
      showToast({ message: 'No se pudo generar el código QR.', tone: 'danger' });
    }
  }

  downloadBtn.addEventListener('click', () => {
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, 'codigo-qr.png');
    });
  });

  textoInput.addEventListener('input', generar);
}
