import { query as queryCollection } from '../../services/dataService.js';
import { escapeHtml, formatDate } from '../../utils.js';

export function render(paciente, panelEl) {
  const consultas = queryCollection('consultas', (c) => c.pacienteId === paciente.id);
  const diagnosticos = consultas
    .flatMap((c) => c.diagnosticos.map((d) => ({ ...d, fecha: c.fecha })))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Diagnósticos (${diagnosticos.length})</h2></div>
      <div class="stack" style="gap:0;">
        ${
          diagnosticos
            .map(
              (d) => `
          <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border-color);">
            <div><span class="badge badge-primary">${escapeHtml(d.cie10)}</span> ${escapeHtml(d.descripcion)}</div>
            <span class="text-tertiary" style="font-size:12px;">${formatDate(d.fecha)}</span>
          </div>`
            )
            .join('') || '<div class="empty-state">Sin diagnósticos registrados.</div>'
        }
      </div>
    </div>
  `;
}
