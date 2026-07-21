import { query as queryCollection } from '../../services/dataService.js';
import { escapeHtml, formatDate } from '../../utils.js';
import { icon } from '../../icons.js';

const TYPE_ICON = { documento: 'file-text', nota: 'note' };

export function render(paciente, panelEl) {
  const documentos = queryCollection(
    'documentos',
    (d) => d.pacienteId === paciente.id && d.tipo !== 'imagen'
  ).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>Documentos (${documentos.length})</h2>
        <a class="btn btn-secondary btn-sm" href="#/documentos?pacienteId=${paciente.id}&tipo=documento">${icon('documents', { size: 14 })} Abrir gestor de archivos</a>
      </div>
      ${
        documentos.length
          ? `<div class="stack" style="gap:0;">
              ${documentos
                .map(
                  (d) => `
                <a href="#/documentos?pacienteId=${paciente.id}" class="file-list-row" style="padding:10px 0; border-bottom:1px solid var(--border-color); color:inherit;">
                  <span class="file-type-icon">${icon(TYPE_ICON[d.tipo] || 'file', { size: 18 })}</span>
                  <div style="min-width:0; flex:1;">
                    <div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(d.nombre)}</div>
                    <div class="text-tertiary" style="font-size:11.5px;">${escapeHtml(d.categoria || '')} · ${formatDate(d.fecha)}</div>
                  </div>
                </a>`
                )
                .join('')}
            </div>`
          : '<div class="empty-state">Sin documentos registrados.</div>'
      }
    </div>
  `;
}
