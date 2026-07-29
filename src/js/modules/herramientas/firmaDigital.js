import { showToast } from '../../components/toast.js';
import { icon } from '../../icons.js';
import { downloadBlob } from '../../utils.js';
import { downloadSignature, removeSignature, uploadSignature } from '../../services/dataService.js';
import { loadSignatures } from '../../services/preferencesService.js';

export async function render(panelEl) {
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
  const saveButton = panelEl.querySelector('#sig-save');
  let galleryUrls = [];

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

  function pos(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  canvas.addEventListener('pointerdown', (event) => {
    drawing = true;
    const point = pos(event);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drawing) return;
    const point = pos(event);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  });
  ['pointerup', 'pointerleave'].forEach((eventName) => canvas.addEventListener(eventName, () => (drawing = false)));

  panelEl.querySelector('#sig-clear').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  panelEl.querySelector('#sig-download').addEventListener('click', () => {
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `firma-${Date.now()}.png`);
    }, 'image/png');
  });

  async function renderGallery() {
    galleryUrls.forEach((url) => URL.revokeObjectURL(url));
    galleryUrls = [];
    galleryEl.innerHTML = '<div class="empty-state">Cargando firmas…</div>';
    try {
      const firmas = await loadSignatures();
      const gallery = await Promise.all(firmas.map(async (firma) => {
        const { blob } = await downloadSignature(firma.id);
        const url = URL.createObjectURL(blob);
        galleryUrls.push(url);
        return { ...firma, url };
      }));
      galleryEl.innerHTML = gallery.length
        ? gallery.map((firma) => `
          <div class="tool-card" style="flex-direction:column; align-items:stretch; gap:8px;">
            <img src="${firma.url}" alt="Firma guardada" style="width:100%; background:#fff; border-radius:var(--radius-sm);" />
            <button type="button" class="btn btn-secondary btn-sm" data-download-firma="${firma.id}">${icon('download', { size: 13 })} Descargar</button>
            <button type="button" class="btn btn-ghost btn-sm" data-remove-firma="${firma.id}">${icon('trash', { size: 13 })} Eliminar</button>
          </div>`).join('')
        : '<div class="empty-state">Sin firmas guardadas.</div>';

      galleryEl.querySelectorAll('[data-download-firma]').forEach((button) => {
        button.addEventListener('click', async () => {
          try {
            const { blob } = await downloadSignature(button.dataset.downloadFirma);
            downloadBlob(blob, `firma-${Date.now()}.png`);
          } catch {
            showToast({ message: 'No se pudo descargar la firma.', tone: 'warning' });
          }
        });
      });
      galleryEl.querySelectorAll('[data-remove-firma]').forEach((button) => {
        button.addEventListener('click', async () => {
          try {
            await removeSignature(button.dataset.removeFirma);
            await renderGallery();
          } catch {
            showToast({ message: 'No se pudo eliminar la firma.', tone: 'warning' });
          }
        });
      });
    } catch {
      galleryEl.innerHTML = '<div class="empty-state">No se pudieron cargar las firmas.</div>';
    }
  }

  saveButton.addEventListener('click', () => {
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      saveButton.disabled = true;
      try {
        const file = new File([blob], `firma-${Date.now()}.png`, { type: 'image/png' });
        await uploadSignature(file);
        await renderGallery();
        showToast({ message: 'Firma guardada y sincronizada.', tone: 'success' });
      } catch {
        showToast({ message: 'No se pudo guardar la firma.', tone: 'warning' });
      } finally {
        saveButton.disabled = false;
      }
    }, 'image/png');
  });

  await renderGallery();
  return () => galleryUrls.forEach((url) => URL.revokeObjectURL(url));
}
