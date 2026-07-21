import { getLocal, setLocal } from '../../storage.js';
import { icon } from '../../icons.js';
import { downloadBlob } from '../../utils.js';
import { showToast } from '../../components/toast.js';

const STORAGE_KEY = 'herramientas_firmas';

export function render(panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Firma digital</h2></div>
      <div class="signature-pad-wrap">
        <canvas id="signature-canvas"></canvas>
      </div>
      <div class="view-actions" style="margin-top:12px;">
        <button type="button" class="btn btn-secondary btn-sm" id="sig-clear">${icon('refresh', { size: 14 })} Limpiar</button>
        <button type="button" class="btn btn-secondary btn-sm" id="sig-download">${icon('download', { size: 14 })} Descargar PNG</button>
        <button type="button" class="btn btn-primary btn-sm" id="sig-save">${icon('save', { size: 14 })} Guardar en galería</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Galería de firmas guardadas</h2></div>
      <div id="sig-gallery" class="favorite-grid"></div>
    </div>
  `;

  const canvas = panelEl.querySelector('#signature-canvas');
  const ctx = canvas.getContext('2d');
  const galleryEl = panelEl.querySelector('#sig-gallery');

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--text-primary') || '#0f172a';
  }
  resizeCanvas();

  let drawing = false;

  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  canvas.addEventListener('pointerdown', (e) => {
    drawing = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });
  ['pointerup', 'pointerleave'].forEach((evt) => canvas.addEventListener(evt, () => (drawing = false)));

  panelEl.querySelector('#sig-clear').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  panelEl.querySelector('#sig-download').addEventListener('click', () => {
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `firma-${Date.now()}.png`);
    });
  });

  panelEl.querySelector('#sig-save').addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/png');
    const nuevas = [{ id: Date.now(), dataUrl }, ...getLocal(STORAGE_KEY, [])].slice(0, 12);
    setLocal(STORAGE_KEY, nuevas);
    renderGallery();
    showToast({ message: 'Firma guardada en la galería local.', tone: 'success' });
  });

  function renderGallery() {
    const items = getLocal(STORAGE_KEY, []);
    galleryEl.innerHTML = items.length
      ? items
          .map(
            (f) => `
        <div class="tool-card" style="flex-direction:column; align-items:stretch; gap:8px;">
          <img src="${f.dataUrl}" alt="Firma guardada" style="width:100%; background:#fff; border-radius:var(--radius-sm);" />
          <button type="button" class="btn btn-ghost btn-sm" data-remove-firma="${f.id}">${icon('trash', { size: 13 })} Eliminar</button>
        </div>`
          )
          .join('')
      : '<div class="empty-state">Sin firmas guardadas.</div>';

    galleryEl.querySelectorAll('[data-remove-firma]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.removeFirma);
        setLocal(STORAGE_KEY, getLocal(STORAGE_KEY, []).filter((f) => f.id !== id));
        renderGallery();
      });
    });
  }

  renderGallery();
}
