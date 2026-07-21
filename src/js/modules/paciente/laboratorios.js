import { query as queryCollection } from '../../services/dataService.js';
import { escapeHtml, formatDate, statusBadgeClass, statusLabel } from '../../utils.js';

export function render(paciente, panelEl) {
  const estudios = queryCollection(
    'estudios',
    (e) => e.pacienteId === paciente.id && e.tipoEstudio === 'laboratorio'
  ).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Estudios de laboratorio (${estudios.length})</h2></div>
      ${
        estudios.length
          ? `<div class="stack" style="gap:0;">
              ${estudios
                .map(
                  (e) => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-color);">
                  <div>
                    <div style="font-size:13px; font-weight:600;">${escapeHtml(e.estudiosSolicitados.join(', '))}</div>
                    <div class="text-tertiary" style="font-size:11.5px;">${formatDate(e.fecha)} · Prioridad: ${escapeHtml(e.prioridad)}</div>
                  </div>
                  <span class="badge ${statusBadgeClass(e.estado)}">${statusLabel(e.estado)}</span>
                </div>`
                )
                .join('')}
            </div>`
          : '<div class="empty-state">Sin órdenes de laboratorio registradas.</div>'
      }
    </div>
  `;
}
