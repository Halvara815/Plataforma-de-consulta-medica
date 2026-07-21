import { icon } from '../../icons.js';
import { downloadBlob } from '../../utils.js';
import { showToast } from '../../components/toast.js';

export function render(panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Grabadora de voz</h2></div>
      <p class="text-tertiary" style="font-size:12.5px; margin-bottom:12px;">Graba notas de voz rápidas (por ejemplo, dictado clínico) directamente desde el micrófono.</p>
      <div class="view-actions">
        <button type="button" class="btn btn-primary btn-sm" id="rec-start">${icon('mic', { size: 14 })} Grabar</button>
        <button type="button" class="btn btn-secondary btn-sm" id="rec-stop" disabled>${icon('square', { size: 14 })} Detener</button>
        <button type="button" class="btn btn-secondary btn-sm" id="rec-download" disabled>${icon('download', { size: 14 })} Descargar .webm</button>
      </div>
      <div id="rec-status" class="text-tertiary" style="font-size:12px; margin-top:10px;"></div>
      <div id="rec-player" style="margin-top:10px;"></div>
    </div>
  `;

  const startBtn = panelEl.querySelector('#rec-start');
  const stopBtn = panelEl.querySelector('#rec-stop');
  const downloadBtn = panelEl.querySelector('#rec-download');
  const statusEl = panelEl.querySelector('#rec-status');
  const playerEl = panelEl.querySelector('#rec-player');

  let mediaRecorder = null;
  let stream = null;
  let chunks = [];
  let lastBlob = null;

  startBtn.addEventListener('click', async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast({ message: 'Este navegador no soporta grabación de audio.', tone: 'danger' });
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      showToast({ message: 'No se pudo acceder al micrófono.', tone: 'danger' });
      return;
    }
    chunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    mediaRecorder.onstop = () => {
      lastBlob = new Blob(chunks, { type: 'audio/webm' });
      playerEl.innerHTML = `<audio controls src="${URL.createObjectURL(lastBlob)}" style="width:100%;"></audio>`;
      downloadBtn.disabled = false;
      statusEl.textContent = 'Grabación detenida.';
      stream.getTracks().forEach((t) => t.stop());
    };
    mediaRecorder.start();
    statusEl.textContent = 'Grabando…';
    startBtn.disabled = true;
    stopBtn.disabled = false;
  });

  stopBtn.addEventListener('click', () => {
    mediaRecorder?.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
  });

  downloadBtn.addEventListener('click', () => {
    if (lastBlob) downloadBlob(lastBlob, `nota-voz-${Date.now()}.webm`);
  });

  return () => {
    mediaRecorder?.state === 'recording' && mediaRecorder.stop();
    stream?.getTracks().forEach((t) => t.stop());
  };
}
