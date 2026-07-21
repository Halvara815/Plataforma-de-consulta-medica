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
          ? `<div class="stack" id="consultas-list" style="gap:8px;">
              ${consultas
                .map(
                  (c, i) => `
                <div class="consulta-item" data-idx="${i}" style="border:1px solid var(--border-color); border-radius:var(--radius-md); overflow:hidden;">
                  <button type="button" class="consulta-item-toggle" style="width:100%; display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 14px; background:var(--bg-surface); text-align:left;">
                    <span>
                      <span style="font-size:13px; font-weight:600;">${escapeHtml(c.motivoConsulta)}</span>
                      <span class="text-tertiary" style="font-size:11.5px; display:block;">${formatDate(c.fecha, { withTime: true })} · ${escapeHtml(medicoNombre(c.medicoId))}</span>
                    </span>
                    ${icon('chevron-down', { size: 16, className: 'icon consulta-chevron' })}
                  </button>
                  <div class="consulta-item-body" style="display:none; padding:0 14px 14px;">
                    <p style="font-size:13px; margin-bottom:8px;"><strong>Padecimiento actual:</strong> ${escapeHtml(c.padecimientoActual || 'Sin información')}</p>
                    <p style="font-size:13px; margin-bottom:8px;"><strong>Exploración física:</strong> ${escapeHtml(c.exploracionFisica || 'Sin información')}</p>
                    <div class="stack" style="gap:4px;">
                      ${(c.diagnosticos || []).map((d) => `<div><span class="badge badge-primary">${escapeHtml(d.cie10)}</span> ${escapeHtml(d.descripcion)}</div>`).join('') || '<span class="text-tertiary" style="font-size:12px;">Sin diagnóstico registrado</span>'}
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
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      item.querySelector('.consulta-chevron').style.transform = isOpen ? '' : 'rotate(180deg)';
    });
  });
}
