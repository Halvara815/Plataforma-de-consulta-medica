import { query as queryCollection } from '../../services/dataService.js';
import { escapeHtml, formatDate } from '../../utils.js';

export function render(paciente, panelEl) {
  const consultas = queryCollection('consultas', (c) => c.pacienteId === paciente.id).sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Planes terapéuticos</h2></div>
      ${
        consultas.length
          ? `<div class="stack">
              ${consultas
                .map(
                  (c) => `
                <div style="border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                  <div style="font-size:12px; color:var(--text-tertiary); margin-bottom:4px;">${formatDate(c.fecha)} · ${escapeHtml(c.motivoConsulta)}</div>
                  <ul style="padding-left:18px; font-size:13px; display:flex; flex-direction:column; gap:4px;">
                    ${(c.planTerapeutico || []).map((p) => `<li>${escapeHtml(p)}</li>`).join('') || '<li class="text-tertiary">Sin plan terapéutico registrado</li>'}
                  </ul>
                </div>`
                )
                .join('')}
            </div>`
          : '<div class="empty-state">Sin tratamientos registrados.</div>'
      }
    </div>
  `;
}
