import { getById, query as queryCollection } from '../../services/dataService.js';
import { escapeHtml, formatDate } from '../../utils.js';
import { icon } from '../../icons.js';

function medicoNombre(medicoId) {
  const medico = getById('medicos', medicoId);
  return medico ? medico.nombre : '';
}

export function render(paciente, panelEl) {
  const consultas = queryCollection('consultas', (c) => c.pacienteId === paciente.id).sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Consultas (${consultas.length})</h2></div>
      ${
        consultas.length
          ? `<div class="consulta-list">
              ${consultas
                .map(
                  (c, i) => `
                <div class="consulta-item" data-idx="${i}">
                  <button type="button" class="consulta-item-toggle">
                    <span class="consulta-item-icon">${icon('stethoscope', { size: 17 })}</span>
                    <span class="consulta-item-main">
                      <span class="consulta-item-title">${escapeHtml(c.motivoConsulta)}</span>
                      <span class="consulta-item-meta">${formatDate(c.fecha, { withTime: true })} · ${escapeHtml(medicoNombre(c.medicoId))}</span>
                    </span>
                    ${icon('chevron-down', { size: 16, className: 'icon consulta-item-chevron' })}
                  </button>
                  <div class="consulta-item-body" style="display:none;">
                    <div class="info-item">
                      <div class="info-label">Padecimiento actual</div>
                      <div class="info-value">${escapeHtml(c.padecimientoActual || 'Sin información')}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Exploración física</div>
                      <div class="info-value">${escapeHtml(c.exploracionFisica || 'Sin información')}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Diagnóstico</div>
                      <div class="stack" style="gap:6px; margin-top:4px;">
                        ${(c.diagnosticos || []).map((d) => `<div><span class="badge badge-primary">${escapeHtml(d.cie10)}</span> ${escapeHtml(d.descripcion)}</div>`).join('') || '<span class="text-tertiary" style="font-size:12px;">Sin diagnóstico registrado</span>'}
                      </div>
                    </div>
                  </div>
                </div>`
                )
                .join('')}
            </div>`
          : '<div class="empty-state">Sin consultas registradas.</div>'
      }
    </div>
  `;

  panelEl.querySelectorAll('.consulta-item-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.consulta-item');
      const body = item.querySelector('.consulta-item-body');
      const isOpen = item.classList.toggle('is-open');
      body.style.display = isOpen ? 'block' : 'none';
    });
  });
}
