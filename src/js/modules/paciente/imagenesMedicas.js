import { query as queryCollection } from '../../services/dataService.js';
import { escapeHtml, formatDate } from '../../utils.js';
import { icon } from '../../icons.js';

export function render(paciente, panelEl) {
  const imagenes = queryCollection('documentos', (d) => d.pacienteId === paciente.id && d.tipo === 'imagen').sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>Imágenes médicas (${imagenes.length})</h2>
        <a class="btn btn-secondary btn-sm" href="#/documentos?pacienteId=${paciente.id}&tipo=imagen">${icon('image', { size: 14 })} Abrir gestor de archivos</a>
      </div>
      ${
        imagenes.length
          ? `<div class="file-grid" style="max-height:none;">
              ${imagenes
                .slice(0, 8)
                .map(
                  (d) => `
                <a class="file-card" href="#/documentos?pacienteId=${paciente.id}&tipo=imagen">
                  <div class="file-card-thumb">${d.blob ? `<img src="${URL.createObjectURL(d.blob)}" alt="" />` : icon('image', { size: 28 })}</div>
                  <div class="file-card-name">${escapeHtml(d.nombre)}</div>
                  <div class="file-card-meta"><span>${escapeHtml(d.categoria || '')}</span><span>${formatDate(d.fecha)}</span></div>
                </a>`
                )
                .join('')}
            </div>`
          : '<div class="empty-state">Sin imágenes médicas registradas.</div>'
      }
    </div>
  `;
}
