import { query as queryCollection } from '../../services/dataService.js';
import { escapeHtml } from '../../utils.js';
import { icon } from '../../icons.js';

export function render(paciente, panelEl) {
  const consultas = queryCollection('consultas', (c) => c.pacienteId === paciente.id).sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );
  const ultima = consultas[0];

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>Antecedentes</h2>
        <a class="btn btn-secondary btn-sm" href="#/historia-clinica/${paciente.id}">${icon('history', { size: 14 })} Ver historia clínica completa</a>
      </div>
      ${
        ultima
          ? `<div class="stack">
              <div class="info-item"><div class="info-label">Heredofamiliares</div><div class="info-value">${escapeHtml(ultima.antecedentes.heredofamiliares || 'Sin información')}</div></div>
              <div class="info-item"><div class="info-label">Personales patológicos</div><div class="info-value">${escapeHtml(ultima.antecedentes.personalesPatologicos || 'Sin información')}</div></div>
              <div class="info-item"><div class="info-label">Personales no patológicos</div><div class="info-value">${escapeHtml(ultima.antecedentes.personalesNoPatologicos || 'Sin información')}</div></div>
            </div>`
          : '<div class="empty-state">Aún no hay consultas registradas para este paciente.</div>'
      }
    </div>
  `;
}
