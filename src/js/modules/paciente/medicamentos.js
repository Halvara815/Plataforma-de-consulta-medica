import { query as queryCollection } from '../../services/dataService.js';
import { escapeHtml, formatDate } from '../../utils.js';
import { icon } from '../../icons.js';

export function render(paciente, panelEl) {
  const recetas = queryCollection('recetas', (r) => r.pacienteId === paciente.id).sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>Medicamentos prescritos</h2>
        <a class="btn btn-secondary btn-sm" href="#/recetas?pacienteId=${paciente.id}">${icon('pill', { size: 14 })} Ver todas las recetas</a>
      </div>
      ${
        recetas.length
          ? `<div class="stack">
              ${recetas
                .map(
                  (r) => `
                <div style="border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <strong style="font-size:13px;">Receta ${escapeHtml(r.folio)}</strong>
                    <span class="text-tertiary" style="font-size:12px;">${formatDate(r.fecha)}</span>
                  </div>
                  <div class="stack" style="gap:4px;">
                    ${r.medicamentos
                      .map(
                        (m) => `<div style="font-size:13px;">${escapeHtml(m.nombre)} ${escapeHtml(m.concentracion)} — <span class="text-tertiary">${escapeHtml(m.dosis)}, ${escapeHtml(m.frecuencia)}</span></div>`
                      )
                      .join('')}
                  </div>
                </div>`
                )
                .join('')}
            </div>`
          : '<div class="empty-state">Sin medicamentos prescritos.</div>'
      }
    </div>
  `;
}
