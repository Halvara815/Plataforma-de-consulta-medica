import { update } from '../../services/dataService.js';
import { openModal } from '../../components/modal.js';
import { textField, selectField, textareaField, getFormData, validateRequired } from '../../components/form.js';
import { escapeHtml, formatDate } from '../../utils.js';
import { icon } from '../../icons.js';
import { showToast } from '../../components/toast.js';

export function render(paciente, panelEl, ctx = {}) {
  const referencias = [...(paciente.referencias || [])].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2>Referencias / Interconsultas (${referencias.length})</h2>
        <button type="button" class="btn btn-primary btn-sm" id="btn-nueva-referencia">${icon('plus', { size: 14 })} Nueva referencia</button>
      </div>
      ${
        referencias.length
          ? `<div class="stack" style="gap:0;">
              ${referencias
                .map(
                  (r) => `
                <div style="padding:10px 0; border-bottom:1px solid var(--border-color);">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="font-size:13px;">${escapeHtml(r.especialidad)} · ${escapeHtml(r.medicoDestino)}</strong>
                    <span class="badge ${r.estado === 'completada' ? 'badge-success' : 'badge-warning'}">${escapeHtml(r.estado)}</span>
                  </div>
                  <div class="text-tertiary" style="font-size:11.5px; margin:4px 0;">${formatDate(r.fecha)}</div>
                  <div style="font-size:13px;">${escapeHtml(r.motivo)}</div>
                </div>`
                )
                .join('')}
            </div>`
          : '<div class="empty-state">Sin referencias registradas.</div>'
      }
    </div>
  `;

  panelEl.querySelector('#btn-nueva-referencia').addEventListener('click', () => openNuevaReferenciaModal(paciente, ctx));
}

function openNuevaReferenciaModal(paciente, ctx) {
  const bodyHtml = `
    <form id="form-nueva-referencia" class="form-grid">
      ${textField({ name: 'especialidad', label: 'Especialidad destino', required: true })}
      ${textField({ name: 'medicoDestino', label: 'Médico / institución destino', required: true })}
      ${textField({ name: 'fecha', label: 'Fecha', type: 'date', required: true, value: new Date().toISOString().slice(0, 10) })}
      ${selectField({ name: 'estado', label: 'Estado', options: [{ value: 'pendiente', label: 'Pendiente' }, { value: 'completada', label: 'Completada' }] })}
      ${textareaField({ name: 'motivo', label: 'Motivo de la referencia', span2: true, rows: 3, required: true })}
    </form>
  `;

  openModal({
    title: 'Nueva referencia',
    bodyHtml,
    footerHtml: `
      <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="modal-save">Guardar referencia</button>
    `,
    onMount: (modalEl, close) => {
      modalEl.querySelector('#modal-cancel').addEventListener('click', close);
      modalEl.querySelector('#modal-save').addEventListener('click', async () => {
        const form = modalEl.querySelector('#form-nueva-referencia');
        if (!validateRequired(form)) return;
        const data = getFormData(form);
        const referencias = [...(paciente.referencias || []), { ...data }];
        await update('pacientes', paciente.id, { referencias });
        close();
        showToast({ message: 'Referencia guardada.', tone: 'success' });
        if (typeof ctx.refresh === 'function') ctx.refresh();
      });
    }
  });
}
