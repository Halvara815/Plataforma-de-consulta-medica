import { getAll, getById, getCatalogos, create, userFacingApiError } from '../services/dataService.js';
import { setTopbarTitle } from '../components/topbar.js';
import { createTable } from '../components/table.js';
import { openModal } from '../components/modal.js';
import { selectField, radioGroup, textField, textareaField, getFormData, validateRequired } from '../components/form.js';
import { escapeHtml, formatDate } from '../utils.js';
import { icon } from '../icons.js';
import { showToast } from '../components/toast.js';
import { appState } from '../state.js';
import { navigateTo } from '../router.js';

let cleanupFns = [];
let medicationRowCount = 0;

export async function mount(container, params = {}, query = {}) {
  setTopbarTitle('Prescripciones / Farmacia', 'Emisión y control de recetas electrónicas');

  container.innerHTML = `
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Recetas / Prescripción electrónica</h1>
          <p>Consulta el historial de recetas y emite nuevas prescripciones con validez legal.</p>
        </div>
        <div class="view-actions">
          <button type="button" class="btn btn-primary" id="btn-nueva-receta">${icon('plus', { size: 15 })} Nueva receta</button>
        </div>
      </div>
      <div class="card" id="recetas-table-card"></div>
    </div>
  `;

  await renderTable(query.pacienteId);

  document.getElementById('btn-nueva-receta').addEventListener('click', () => openNuevaRecetaModal(query.pacienteId));
  if (query.action === 'nueva') openNuevaRecetaModal(query.pacienteId);
}

async function renderTable(pacienteFiltro) {
  const cardEl = document.getElementById('recetas-table-card');
  const pacientes = await getAll('pacientes', { limit: 100 });
  const options = pacientes
    .map((paciente) => `<option value="${paciente.id}" ${paciente.id === pacienteFiltro ? 'selected' : ''}>${escapeHtml(paciente.nombre)} ${escapeHtml(paciente.apellidos)}</option>`)
    .join('');
  cardEl.innerHTML = `
    <div class="form-field" style="max-width:420px; margin-bottom:16px;">
      <label for="recetas-paciente-filter">Paciente</label>
      <select class="input" id="recetas-paciente-filter"><option value="">Selecciona un paciente para consultar sus recetas</option>${options}</select>
    </div>
    <div id="recetas-table-content"></div>`;

  const selector = cardEl.querySelector('#recetas-paciente-filter');
  selector.addEventListener('change', () => {
    navigateTo(selector.value ? `#/recetas?pacienteId=${encodeURIComponent(selector.value)}` : '#/recetas');
  });

  const tableContent = cardEl.querySelector('#recetas-table-content');
  if (!pacienteFiltro) {
    tableContent.innerHTML = '<div class="empty-state">Selecciona un paciente para consultar únicamente sus recetas autorizadas.</div>';
    return;
  }

  let recetas = await getAll('recetas', { pacienteId: pacienteFiltro });
  recetas = [...recetas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const rows = recetas.map((r) => {
    const paciente = pacientes.find((p) => p.id === r.pacienteId);
    return {
      ...r,
      pacienteNombre: paciente ? `${paciente.nombre} ${paciente.apellidos}` : 'Paciente no encontrado',
      medicamentosCount: r.medicamentos.length
    };
  });

  const table = createTable({
    columns: [
      { key: 'folio', label: 'Folio', sortable: true },
      { key: 'pacienteNombre', label: 'Paciente', sortable: true },
      { key: 'fecha', label: 'Fecha', sortable: true, render: (row) => formatDate(row.fecha) },
      { key: 'tipo', label: 'Tipo', sortable: true, render: (row) => `<span class="badge">${escapeHtml(row.tipo)}</span>` },
      { key: 'medicamentosCount', label: 'Medicamentos', sortable: true },
      {
        key: 'estado',
        label: 'Estado',
        sortable: true,
        render: (row) => `<span class="badge ${row.estado === 'activa' ? 'badge-success' : 'badge'}">${escapeHtml(row.estado)}</span>`
      }
    ],
    rows,
    searchableKeys: ['folio', 'pacienteNombre'],
    searchPlaceholder: 'Buscar por folio o paciente…',
    emptyMessage: 'No hay recetas registradas todavía.',
    onRowClick: (row) => openDetalleReceta(row)
  });

  tableContent.appendChild(table.el);
}

async function openDetalleReceta(receta) {
  const paciente = await getById('pacientes', receta.pacienteId);
  const medico = await getById('medicos', receta.medicoId);

  const bodyHtml = `
    <div class="stack">
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Paciente</div><div class="info-value">${escapeHtml(paciente?.nombre || '')} ${escapeHtml(paciente?.apellidos || '')}</div></div>
        <div class="info-item"><div class="info-label">Médico</div><div class="info-value">${escapeHtml(medico?.nombre || '')}</div></div>
        <div class="info-item"><div class="info-label">Fecha</div><div class="info-value">${formatDate(receta.fecha)}</div></div>
        <div class="info-item"><div class="info-label">Vigencia</div><div class="info-value">${receta.vigenciaDias} días</div></div>
      </div>
      <hr class="divider" />
      <div class="stack" style="gap:10px;">
        ${receta.medicamentos
          .map(
            (m, i) => `
          <div style="padding:10px; border:1px solid var(--border-color); border-radius:var(--radius-md);">
            <strong>${i + 1}. ${escapeHtml(m.nombre)} ${escapeHtml(m.concentracion)}</strong>
            <div class="info-grid" style="margin-top:6px;">
              <div class="info-item"><div class="info-label">Dosis</div><div class="info-value">${escapeHtml(m.dosis)}</div></div>
              <div class="info-item"><div class="info-label">Frecuencia</div><div class="info-value">${escapeHtml(m.frecuencia)}</div></div>
              <div class="info-item"><div class="info-label">Duración</div><div class="info-value">${escapeHtml(m.duracion)}</div></div>
              <div class="info-item"><div class="info-label">Vía</div><div class="info-value">${escapeHtml(m.via)}</div></div>
            </div>
            ${m.indicaciones ? `<div class="text-tertiary" style="font-size:12px; margin-top:6px;">${escapeHtml(m.indicaciones)}</div>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
      ${
        receta.interacciones.length
          ? `<div class="stack" style="gap:8px;">
              ${receta.interacciones
                .map(
                  (i) =>
                    `<div class="badge badge-warning" style="display:flex; align-items:center; gap:6px; padding:10px; font-weight:400; font-size:12.5px;">${icon('alert-triangle', { size: 14 })} ${escapeHtml(i.descripcion)}</div>`
                )
                .join('')}
            </div>`
          : ''
      }
      ${receta.notasPaciente ? `<div class="info-item"><div class="info-label">Notas para el paciente</div><div class="info-value">${escapeHtml(receta.notasPaciente)}</div></div>` : ''}
    </div>
  `;

  openModal({
    title: `Receta ${receta.folio}`,
    bodyHtml,
    size: 'lg',
    footerHtml: `
      <button type="button" class="btn btn-secondary" id="btn-print-receta">${icon('printer', { size: 14 })} Imprimir</button>
      <button type="button" class="btn btn-primary" id="btn-close-receta">Cerrar</button>
    `,
    onMount: (modalEl, close) => {
      modalEl.querySelector('#btn-close-receta').addEventListener('click', close);
      modalEl.querySelector('#btn-print-receta').addEventListener('click', () => window.print());
    }
  });
}

async function openNuevaRecetaModal(pacienteFiltro) {
  const pacientes = await getAll('pacientes');
  const catalogos = await getCatalogos();
  const { currentUser } = appState.getState();
  medicationRowCount = 0;

  const bodyHtml = `
    <form id="form-nueva-receta" class="stack">
      <div class="form-grid">
        ${selectField({ name: 'pacienteId', label: 'Paciente', required: true, span2: true, value: pacienteFiltro || '', options: pacientes.map((p) => ({ value: p.id, label: `${p.nombre} ${p.apellidos}` })) })}
        ${radioGroup({ name: 'tipo', label: 'Tipo de receta', value: 'ambulatoria', options: [{ value: 'ambulatoria', label: 'Ambulatoria' }, { value: 'controlado', label: 'Controlado' }, { value: 'especial', label: 'Especial' }] })}
        ${textField({ name: 'vigenciaDias', label: 'Vigencia (días)', type: 'number', value: '5', required: true })}
      </div>
      <div class="card-header" style="margin-top:8px;">
        <h3>Medicamentos</h3>
        <button type="button" class="btn btn-secondary btn-sm" id="btn-agregar-medicamento">${icon('plus', { size: 14 })} Agregar medicamento</button>
      </div>
      <div id="medicamentos-rows" class="stack" style="gap:10px;"></div>
      <div id="interacciones-preview"></div>
      ${textareaField({ name: 'notasPaciente', label: 'Notas adicionales (para el paciente)', span2: true, rows: 2 })}
    </form>
  `;

  openModal({
    title: 'Nueva receta',
    bodyHtml,
    size: 'lg',
    footerHtml: `
      <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="modal-save">Guardar y cerrar</button>
    `,
    onMount: (modalEl, close) => {
      const rowsContainer = modalEl.querySelector('#medicamentos-rows');
      addMedicationRow(rowsContainer, catalogos);

      modalEl.querySelector('#btn-agregar-medicamento').addEventListener('click', () => {
        addMedicationRow(rowsContainer, catalogos);
      });

      rowsContainer.addEventListener('click', (e) => {
        if (e.target.matches('[data-remove-row]')) {
          e.target.closest('.medicamento-row').remove();
          updateInteractionsPreview(modalEl, catalogos);
        }
      });
      rowsContainer.addEventListener('change', () => updateInteractionsPreview(modalEl, catalogos));

      modalEl.querySelector('#modal-cancel').addEventListener('click', close);
      modalEl.querySelector('#modal-save').addEventListener('click', async () => {
        const form = modalEl.querySelector('#form-nueva-receta');
        if (!validateRequired(form)) return;

        const medicamentos = [...rowsContainer.querySelectorAll('.medicamento-row')].map((row) => ({
          nombre: row.querySelector('[name="med-nombre"]').value,
          concentracion: row.querySelector('[name="med-concentracion"]').value,
          dosis: row.querySelector('[name="med-dosis"]').value || '1 tableta',
          frecuencia: row.querySelector('[name="med-frecuencia"]').value || 'Cada 24 h',
          duracion: row.querySelector('[name="med-duracion"]').value || '5 días',
          via: row.querySelector('[name="med-via"]').value,
          indicaciones: row.querySelector('[name="med-indicaciones"]').value
        }));

        if (!medicamentos.length) {
          alert('Agrega al menos un medicamento a la receta.');
          return;
        }

        if (!currentUser?.medicoId) {
          showToast({ message: 'Tu cuenta no tiene un médico vinculado; no puedes emitir recetas.', tone: 'danger' });
          return;
        }

        const data = getFormData(form);
        const interacciones = findInteractions(medicamentos, catalogos);

        try {
          await create('recetas', {
            pacienteId: data.pacienteId,
            medicoId: currentUser.medicoId,
            fecha: new Date().toISOString().slice(0, 10),
            tipo: data.tipo,
            vigenciaDias: parseInt(data.vigenciaDias, 10) || 5,
            medicamentos,
            interacciones,
            notasPaciente: data.notasPaciente || ''
          });

          close();
          navigateTo(`#/recetas?pacienteId=${encodeURIComponent(data.pacienteId)}`);
        } catch (error) {
          showToast({ message: userFacingApiError(error), tone: 'danger' });
        }
      });
    }
  });
}

function addMedicationRow(container, catalogos) {
  medicationRowCount += 1;
  const row = document.createElement('div');
  row.className = 'medicamento-row';
  row.style.cssText = 'padding:12px; border:1px solid var(--border-color); border-radius:var(--radius-md); position:relative;';
  row.innerHTML = `
    <button type="button" data-remove-row class="btn btn-ghost btn-sm" style="position:absolute; top:8px; right:8px;">${icon('x', { size: 14 })}</button>
    <div class="form-grid">
      <div class="form-field span-2">
        <label>Medicamento</label>
        <select class="input" name="med-nombre">
          ${catalogos.medicamentos.map((m) => `<option value="${escapeHtml(m.nombre)}">${escapeHtml(m.nombre)}</option>`).join('')}
        </select>
      </div>
      <div class="form-field">
        <label>Concentración</label>
        <input class="input" name="med-concentracion" value="${escapeHtml(catalogos.medicamentos[0]?.presentaciones[0] || '')}" />
      </div>
      <div class="form-field">
        <label>Dosis</label>
        <input class="input" name="med-dosis" value="1 tableta" />
      </div>
      <div class="form-field">
        <label>Frecuencia</label>
        <input class="input" name="med-frecuencia" value="Cada 24 h" />
      </div>
      <div class="form-field">
        <label>Duración</label>
        <input class="input" name="med-duracion" value="5 días" />
      </div>
      <div class="form-field">
        <label>Vía</label>
        <select class="input" name="med-via">
          <option>Oral</option>
          <option>Tópica</option>
          <option>Inyectable</option>
          <option>Inhalada</option>
        </select>
      </div>
      <div class="form-field span-2">
        <label>Indicaciones</label>
        <input class="input" name="med-indicaciones" placeholder="Ej. Tomar con alimentos" />
      </div>
    </div>
  `;
  container.appendChild(row);
}

function findInteractions(medicamentos, catalogos) {
  const nombres = medicamentos.map((m) => m.nombre);
  return catalogos.interaccionesConocidas.filter((regla) => regla.medicamentos.every((med) => nombres.includes(med)));
}

function updateInteractionsPreview(modalEl, catalogos) {
  const rowsContainer = modalEl.querySelector('#medicamentos-rows');
  const preview = modalEl.querySelector('#interacciones-preview');
  const nombres = [...rowsContainer.querySelectorAll('[name="med-nombre"]')].map((s) => s.value);
  const medicamentosFake = nombres.map((n) => ({ nombre: n }));
  const interacciones = findInteractions(medicamentosFake, catalogos);
  preview.innerHTML = interacciones.length
    ? interacciones
        .map((i) => `<div class="badge badge-warning" style="display:flex; align-items:center; gap:6px; padding:10px; font-weight:400; font-size:12.5px; margin-bottom:6px;">${icon('alert-triangle', { size: 14 })} Interacción detectada: ${escapeHtml(i.descripcion)}</div>`)
        .join('')
    : '';
}

export function unmount() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
}
