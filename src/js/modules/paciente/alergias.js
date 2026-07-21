import { escapeHtml } from '../../utils.js';

export function render(paciente, panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Alergias y reacciones (${paciente.alergias.length})</h2></div>
      ${
        paciente.alergias.length
          ? `<div class="stack" style="gap:0;">
              ${paciente.alergias
                .map(
                  (a) => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-color);">
                  <span class="badge badge-danger">${escapeHtml(a.sustancia)}</span>
                  <span class="text-tertiary" style="font-size:12px;">Reacción: ${escapeHtml(a.reaccion)}</span>
                </div>`
                )
                .join('')}
            </div>`
          : '<div class="empty-state">Sin alergias registradas.</div>'
      }
    </div>
    <div class="card">
      <div class="card-header"><h2>Alertas clínicas (${paciente.alertas.length})</h2></div>
      ${
        paciente.alertas.length
          ? `<div class="stack" style="gap:0;">
              ${paciente.alertas
                .map(
                  (a) => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-color);">
                  <div>
                    <div style="font-size:13px; font-weight:600;">${escapeHtml(a.tipo)}</div>
                    <div class="text-tertiary" style="font-size:12px;">${escapeHtml(a.descripcion)}</div>
                  </div>
                  <span class="badge ${a.activa ? 'badge-warning' : ''}">${a.activa ? 'Activa' : 'Resuelta'}</span>
                </div>`
                )
                .join('')}
            </div>`
          : '<div class="empty-state">Sin alertas clínicas activas.</div>'
      }
    </div>
  `;
}
