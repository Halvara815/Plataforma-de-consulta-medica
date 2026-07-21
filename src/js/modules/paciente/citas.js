import { query as queryCollection } from '../../services/dataService.js';
import { escapeHtml, formatDate, statusBadgeClass, statusLabel } from '../../utils.js';
import { icon } from '../../icons.js';

export function render(paciente, panelEl) {
  const citas = queryCollection('citas', (c) => c.pacienteId === paciente.id).sort(
    (a, b) => new Date(`${b.fecha}T${b.horaInicio || '00:00'}`) - new Date(`${a.fecha}T${a.horaInicio || '00:00'}`)
  );

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>Citas (${citas.length})</h2>
        <a class="btn btn-secondary btn-sm" href="#/agenda?pacienteId=${paciente.id}">${icon('calendar', { size: 14 })} Abrir agenda</a>
      </div>
      ${
        citas.length
          ? `<div class="stack" style="gap:0;">
              ${citas
                .map(
                  (c) => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-color);">
                  <div>
                    <div style="font-size:13px; font-weight:600;">${escapeHtml(c.motivo)}</div>
                    <div class="text-tertiary" style="font-size:11.5px;">${formatDate(c.fecha)} · ${escapeHtml(c.horaInicio)}–${escapeHtml(c.horaFin)}</div>
                  </div>
                  <span class="badge ${statusBadgeClass(c.estado)}">${statusLabel(c.estado)}</span>
                </div>`
                )
                .join('')}
            </div>`
          : '<div class="empty-state">Sin citas registradas.</div>'
      }
    </div>
  `;
}
