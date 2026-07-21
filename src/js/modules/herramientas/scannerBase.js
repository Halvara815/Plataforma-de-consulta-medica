import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';
import { escapeHtml } from '../../utils.js';
import { icon } from '../../icons.js';
import { showToast } from '../../components/toast.js';

/**
 * Escáner de cámara compartido por Lector de código QR y Lector de código de barras.
 * `formats` restringe los formatos que ZXing intentará decodificar.
 */
export function mountScanner(panelEl, { title, formats, hint }) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>${escapeHtml(title)}</h2></div>
      <p class="text-tertiary" style="font-size:12.5px; margin-bottom:12px;">${escapeHtml(hint)}</p>
      <div class="view-actions" style="margin-bottom:12px;">
        <button type="button" class="btn btn-primary btn-sm" id="scan-start">${icon('camera', { size: 14 })} Iniciar cámara</button>
        <button type="button" class="btn btn-secondary btn-sm" id="scan-stop" disabled>${icon('square', { size: 14 })} Detener</button>
      </div>
      <div class="scanner-frame"><video id="scan-video" playsinline muted></video></div>
      <div id="scan-result" style="margin-top:14px;"></div>
    </div>
  `;

  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats.map((f) => BarcodeFormat[f]));
  const codeReader = new BrowserMultiFormatReader(hints);

  const startBtn = panelEl.querySelector('#scan-start');
  const stopBtn = panelEl.querySelector('#scan-stop');
  const videoEl = panelEl.querySelector('#scan-video');
  const resultEl = panelEl.querySelector('#scan-result');

  let controls = null;

  function showResult(text) {
    resultEl.innerHTML = `
      <div class="info-item">
        <div class="info-label">Resultado</div>
        <div class="info-value" style="word-break:break-all;">${escapeHtml(text)}</div>
      </div>
      <div class="view-actions" style="margin-top:8px;">
        <button type="button" class="btn btn-secondary btn-sm" id="scan-copy">${icon('copy', { size: 14 })} Copiar</button>
      </div>
    `;
    resultEl.querySelector('#scan-copy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        showToast({ message: 'Resultado copiado al portapapeles.', tone: 'success' });
      } catch {
        showToast({ message: 'No se pudo copiar automáticamente.', tone: 'warning' });
      }
    });
  }

  async function start() {
    try {
      startBtn.disabled = true;
      controls = await codeReader.decodeFromVideoDevice(undefined, videoEl, (result) => {
        if (result) showResult(result.getText());
      });
      stopBtn.disabled = false;
    } catch (err) {
      console.error(err);
      startBtn.disabled = false;
      showToast({ message: 'No se pudo acceder a la cámara. Revisa los permisos del navegador.', tone: 'danger' });
    }
  }

  function stop() {
    if (controls) {
      controls.stop();
      controls = null;
    }
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }

  startBtn.addEventListener('click', start);
  stopBtn.addEventListener('click', stop);

  return () => stop();
}
