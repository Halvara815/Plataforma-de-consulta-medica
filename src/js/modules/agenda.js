import { getAll, getById, getCatalogos, create, update } from '../services/dataService.js';
import { setTopbarTitle } from '../components/topbar.js';
import { cardHtml } from '../components/card.js';
import { openModal } from '../components/modal.js';
import { textField, selectField, getFormData, validateRequired } from '../components/form.js';
import { escapeHtml, formatDate, statusBadgeClass, statusLabel } from '../utils.js';

// Ver nota en dashboard.js: fecha ancla de la demo para que la agenda muestre contenido representativo.
const DEMO_TODAY = '2026-07-20';
const DAY_MS = 24 * 60 * 60 * 1000;

let cleanupFns = [];
let state = {
  date: DEMO_TODAY,
  medicoId: '',
  consultorio: '',
  estado: '',
  selectedCitaId: null
};

export async function mount(container, params = {}, query = {}) {
  setTopbarTitle('Agenda / Citas', 'Gestione y programe las citas de sus pacientes');
  state = { date: DEMO_TODAY, medicoId: '', consultorio: '', estado: '', selectedCitaId: null };

  container.innerHTML = `
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Agenda / Citas</h1>
          <p>Gestione y programe las citas de sus pacientes</p>
        </div>
        <div class="view-actions">
          <button type="button" class="btn btn-primary" id="btn-nueva-cita">➕ Nueva cita</button>
        </div>
      </div>

      <div class="card">
        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; justify-content:space-between;">
          <div style="display:flex; gap:8px; align-items:center;">
            <button type="button" class="btn btn-ghost btn-sm" id="btn-prev-day">‹</button>
            <input type="date" class="input" id="agenda-date-input" value="${state.date}" style="width:auto;" />
            <button type="button" class="btn btn-ghost btn-sm" id="btn-next-day">›</button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-today">Hoy</button>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <select class="input" id="filter-medico" style="width:auto;"></select>
            <select class="input" id="filter-consultorio" style="width:auto;"></select>
            <select class="input" id="filter-estado" style="width:auto;"></select>
          </div>
        </div>
      </div>

      <div class="two-col">
        <div id="agenda-list-container"></div>
        <div class="stack">
          <div id="agenda-detail-container"></div>
          <div id="agenda-summary-container"></div>
        </div>
      </div>
    </div>
  `;

  populateFilters();
  render();

  document.getElementById('btn-nueva-cita').addEventListener('click', openNuevaCitaModal);
  document.getElementById('agenda-date-input').addEventListener('change', (e) => {
    state.date = e.target.value;
    state.selectedCitaId = null;
    render();
  });
  document.getElementById('btn-prev-day').addEventListener('click', () => shiftDay(-1));
  document.getElementById('btn-next-day').addEventListener('click', () => shiftDay(1));
  document.getElementById('btn-today').addEventListener('click', () => {
    state.date = DEMO_TODAY;
    document.getElementById('agenda-date-input').value = DEMO_TODAY;
    render();
  });
  ['filter-medico', 'filter-consultorio', 'filter-estado'].forEach((id) => {
    document.getElementById(id).addEventListener('change', (e) => {
      const key = id === 'filter-medico' ? 'medicoId' : id === 'filter-consultorio' ? 'consultorio' : 'estado';
      state[key] = e.target.value;
      render();
    });
  });

  if (query.pacienteId) {
    state.pacienteFiltro = query.pacienteId;
  }
}

function shiftDay(delta) {
  const d = new Date(`${state.date}T00:00:00`);
  d.setTime(d.getTime() + delta * DAY_MS);
  state.date = d.toISOString().slice(0, 10);
  document.getElementById('agenda-date-input').value = state.date;
  state.selectedCitaId = null;
  render();
}

function populateFilters() {
  const catalogos = getCatalogos();
  const medicos = getAll('medicos');

  const medicoSelect = document.getElementById('filter-medico');
  medicoSelect.innerHTML =
    '<option value="">Todos los doctores</option>' + medicos.map((m) => `<option value="${m.id}">${escapeHtml(m.nombre)}</option>`).join('');

  const consultorioSelect = document.getElementById('filter-consultorio');
  consultorioSelect.innerHTML =
    '<option value="">Todos los consultorios</option>' +
    catalogos.consultorios.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');

  const estadoSelect = document.getElementById('filter-estado');
  estadoSelect.innerHTML =
    '<option value="">Todos los estados</option>' +
    catalogos.estadosCita.map((s) => `<option value="${s}">${statusLabel(s)}</option>`).join('');
}

function getFilteredCitas() {
  return getAll('citas')
    .filter((c) => c.fecha === state.date)
    .filter((c) => !state.medicoId || c.medicoId === state.medicoId)
    .filter((c) => !state.consultorio || c.consultorioId === state.consultorio)
    .filter((c) => !state.estado || c.estado === state.estado)
    .filter((c) => !state.pacienteFiltro || c.pacienteId === state.pacienteFiltro)
    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
}

function render() {
  const citas = getFilteredCitas();
  if (!state.selectedCitaId || !citas.some((c) => c.id === state.selectedCitaId)) {
    state.selectedCitaId = citas.find((c) => c.pacienteId)?.id || citas[0]?.id || null;
  }
  renderList(citas);
  renderDetail(citas.find((c) => c.id === state.selectedCitaId));
  renderSummary(citas);
}

function renderList(citas) {
  const el = document.getElementById('agenda-list-container');
  el.innerHTML = cardHtml({
    title: `Agenda · ${formatDate(state.date)}`,
    bodyHtml: citas.length
      ? `<div class="stack" id="agenda-list">${citas
          .map((cita) => {
            const paciente = cita.pacienteId ? getById('pacientes', cita.pacienteId) : null;
            const label = paciente ? `${paciente.nombre} ${paciente.apellidos}` : cita.motivo;
            return `
              <div class="patient-directory-item${cita.id === state.selectedCitaId ? ' is-active' : ''}" data-cita-id="${cita.id}" style="justify-content:space-between;">
                <div style="display:flex; gap:12px; align-items:center; min-width:0;">
                  <strong style="min-width:48px; font-size:12.5px; color:var(--text-secondary);">${cita.horaInicio}</strong>
                  <div style="min-width:0;">
                    <div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(label)}</div>
                    <div class="text-tertiary" style="font-size:11.5px;">${escapeHtml(paciente ? cita.motivo : cita.consultorioId)}</div>
                  </div>
                </div>
                <span class="badge ${statusBadgeClass(cita.estado)}">${statusLabel(cita.estado)}</span>
              </div>
            `;
          })
          .join('')}</div>`
      : '<div class="empty-state">No hay citas para esta fecha con los filtros seleccionados.</div>'
  });

  el.querySelectorAll('[data-cita-id]').forEach((row) => {
    row.addEventListener('click', () => {
      state.selectedCitaId = row.dataset.citaId;
      render();
    });
  });
}

function renderDetail(cita) {
  const el = document.getElementById('agenda-detail-container');
  if (!cita) {
    el.innerHTML = cardHtml({ title: 'Detalle de la cita', bodyHtml: '<div class="empty-state">Selecciona una cita.</div>' });
    return;
  }
  const paciente = cita.pacienteId ? getById('pacientes', cita.pacienteId) : null;
  const medico = getById('medicos', cita.medicoId);

  el.innerHTML = cardHtml({
    title: 'Detalle de la cita',
    bodyHtml: `
      <div class="stack">
        ${
          paciente
            ? `<div><strong>${escapeHtml(paciente.nombre)} ${escapeHtml(paciente.apellidos)}</strong><div class="text-tertiary" style="font-size:12px;">ID: ${escapeHtml(paciente.id)}</div></div>`
            : `<div><strong>${escapeHtml(cita.motivo)}</strong></div>`
        }
        <div class="info-grid">
          <div class="info-item"><div class="info-label">Fecha</div><div class="info-value">${formatDate(cita.fecha)}</div></div>
          <div class="info-item"><div class="info-label">Hora</div><div class="info-value">${cita.horaInicio} - ${cita.horaFin}</div></div>
          <div class="info-item"><div class="info-label">Consultorio</div><div class="info-value">${escapeHtml(cita.consultorioId)}</div></div>
          <div class="info-item"><div class="info-label">Médico</div><div class="info-value">${escapeHtml(medico?.nombre || '—')}</div></div>
        </div>
        ${cita.motivo && paciente ? `<div class="info-item"><div class="info-label">Motivo</div><div class="info-value">${escapeHtml(cita.motivo)}</div></div>` : ''}
        ${cita.notas ? `<div class="info-item"><div class="info-label">Notas</div><div class="info-value">${escapeHtml(cita.notas)}</div></div>` : ''}
        <span class="badge ${statusBadgeClass(cita.estado)}" style="width:fit-content;">${statusLabel(cita.estado)}</span>
        ${
          paciente
            ? `<div class="view-actions" style="margin-top:6px;">
                <a class="btn btn-primary btn-sm" href="#/consulta/${paciente.id}">Iniciar consulta</a>
                <a class="btn btn-secondary btn-sm" href="#/historia-clinica/${paciente.id}">Historia clínica</a>
                <button type="button" class="btn btn-danger btn-sm" id="btn-cancelar-cita" ${cita.estado === 'cancelada' ? 'disabled' : ''}>Cancelar cita</button>
              </div>`
            : ''
        }
      </div>
    `
  });

  const cancelBtn = document.getElementById('btn-cancelar-cita');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', async () => {
      await update('citas', cita.id, { estado: 'cancelada' });
      render();
    });
  }
}

function renderSummary(citas) {
  const el = document.getElementById('agenda-summary-container');
  const counts = citas.reduce((acc, c) => {
    acc[c.estado] = (acc[c.estado] || 0) + 1;
    return acc;
  }, {});
  el.innerHTML = cardHtml({
    title: 'Resumen del día',
    bodyHtml: `
      <div class="stack" style="gap:6px;">
        <div style="display:flex; justify-content:space-between; font-size:13px;"><span>Total de citas</span><strong>${citas.length}</strong></div>
        ${Object.entries(counts)
          .map(
            ([estado, count]) =>
              `<div style="display:flex; justify-content:space-between; font-size:12.5px;"><span class="badge ${statusBadgeClass(estado)}">${statusLabel(estado)}</span><span>${count}</span></div>`
          )
          .join('')}
      </div>
    `
  });
}

function openNuevaCitaModal() {
  const pacientes = getAll('pacientes');
  const medicos = getAll('medicos');
  const catalogos = getCatalogos();

  const bodyHtml = `
    <form id="form-nueva-cita" class="form-grid">
      ${selectField({ name: 'pacienteId', label: 'Paciente', required: true, span2: true, options: pacientes.map((p) => ({ value: p.id, label: `${p.nombre} ${p.apellidos}` })) })}
      ${selectField({ name: 'medicoId', label: 'Médico', required: true, options: medicos.map((m) => ({ value: m.id, label: m.nombre })) })}
      ${selectField({ name: 'consultorioId', label: 'Consultorio', required: true, options: catalogos.consultorios })}
      ${textField({ name: 'fecha', label: 'Fecha', type: 'date', required: true, value: state.date })}
      ${textField({ name: 'horaInicio', label: 'Hora inicio', type: 'time', required: true })}
      ${textField({ name: 'horaFin', label: 'Hora fin', type: 'time', required: true })}
      ${textField({ name: 'motivo', label: 'Motivo de consulta', span2: true, required: true })}
    </form>
  `;

  openModal({
    title: 'Nueva cita',
    bodyHtml,
    footerHtml: `
      <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="modal-save">Guardar cita</button>
    `,
    onMount: (modalEl, close) => {
      modalEl.querySelector('#modal-cancel').addEventListener('click', close);
      modalEl.querySelector('#modal-save').addEventListener('click', async () => {
        const form = modalEl.querySelector('#form-nueva-cita');
        if (!validateRequired(form)) return;
        const data = getFormData(form);
        await create('citas', {
          pacienteId: data.pacienteId,
          medicoId: data.medicoId,
          consultorioId: data.consultorioId,
          fecha: data.fecha,
          horaInicio: data.horaInicio,
          horaFin: data.horaFin,
          motivo: data.motivo,
          estado: 'confirmada',
          notas: '',
          recordatorios: []
        });
        close();
        state.date = data.fecha;
        document.getElementById('agenda-date-input').value = data.fecha;
        render();
      });
    }
  });
}

export function unmount() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
}
