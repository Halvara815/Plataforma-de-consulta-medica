import { icon } from '../../icons.js';
import { downloadBlob } from '../../utils.js';
import { showToast } from '../../components/toast.js';

export function render(panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Captura de pantalla</h2></div>
      <p class="text-tertiary" style="font-size:12.5px; margin-bottom:12px;">Captura la pantalla, una ventana o una pestaña del navegador y descárgala como imagen.</p>
      <div class="view-actions">
        <button type="button" class="btn btn-primary btn-sm" id="capture-start">${icon('screen', { size: 14 })} Capturar pantalla</button>
        <button type="button" class="btn btn-secondary btn-sm" id="capture-download" disabled>${icon('download', { size: 14 })} Descargar PNG</button>
      </div>
      <div id="capture-preview" style="margin-top:16px;"></div>
    </div>
  `;

  const startBtn = panelEl.querySelector('#capture-start');
  const downloadBtn = panelEl.querySelector('#capture-download');
  const previewEl = panelEl.querySelector('#capture-preview');
  let lastBlob = null;

  startBtn.addEventListener('click', async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      showToast({ message: 'Este navegador no soporta captura de pantalla.', tone: 'danger' });
      return;
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    } catch {
      showToast({ message: 'Captura cancelada o sin permiso.', tone: 'warning' });
      return;
    }
    const track = stream.getVideoTracks()[0];
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    track.stop();

    canvas.toBlob((blob) => {
      lastBlob = blob;
      previewEl.innerHTML = '';
      const img = document.createElement('img');
      img.src = URL.createObjectURL(blob);
      img.style.cssText = 'max-width:100%; border-radius:var(--radius-md); border:1px solid var(--border-color);';
      previewEl.appendChild(img);
      downloadBtn.disabled = false;
    }, 'image/png');
  });

  downloadBtn.addEventListener('click', () => {
    if (lastBlob) downloadBlob(lastBlob, `captura-${Date.now()}.png`);
  });
}
