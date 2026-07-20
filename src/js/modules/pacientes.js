import { getAll, getById, create, query as queryCollection } from '../services/dataService.js';
import { setTopbarTitle } from '../components/topbar.js';
import { cardHtml } from '../components/card.js';
import { createTabs } from '../components/tabs.js';
import { openModal } from '../components/modal.js';
import { textField, selectField, getFormData, validateRequired } from '../components/form.js';
import { navigateTo } from '../router.js';
import { calcAge, escapeHtml, formatDate, initials } from '../utils.js';

let cleanupFns = [];
let activeTabs = null;

export async function mount(container, params = {}, query = {}) {
  setTopbarTitle('Pacientes', 'Consulta, gestiona y mantén la información clínica de tus pacientes');

  const pacientes = getAll('pacientes');
  const searchTerm = query.q || '';
  const filtered = searchTerm
    ? pacientes.filter((p) =>
        `${p.nombre} ${p.apellidos} ${p.id}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : pacientes;

  const selectedId = params.id || (filtered[0] || pacientes[0])?.id;
  const paciente = selectedId ? getById('pacientes', selectedId) : null;

  container.innerHTML = `
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Pacientes / Identificación del Paciente</h1>
          <p>Consulta, gestiona y mantén la información demográfica y clínica de tus pacientes.</p>
        </div>
        <div class="view-actions">
          <button type="button" class="btn btn-primary" id="btn-nuevo-paciente">➕ Nuevo paciente</button>
        </div>
      </div>
      <div class="three-col" id="pacientes-layout"></div>
    </div>
  `;

  renderLayout(container, pacientes, filtered, paciente, searchTerm);

  const nuevoBtn = document.getElementById('btn-nuevo-paciente');
  const openNuevo = () => openNuevoPacienteModal();
  nuevoBtn.addEventListener('click', openNuevo);
  cleanupFns.push(() => nuevoBtn.removeEventListener('click', openNuevo));

  if (query.action === 'nuevo') openNuevoPacienteModal();
}

function renderLayout(container, allPacientes, filtered, paciente, searchTerm) {
  const layoutEl = document.getElementById('pacientes-layout');

  layoutEl.innerHTML = `
    <div class="card">
      <div class="stack" style="gap:10px;">
        <div class="table-search">
          <span aria-hidden="true">🔍</span>
          <input type="search" id="paciente-search" placeholder="Buscar pacientes…" value="${escapeHtml(searchTerm)}" />
        </div>
        <div class="text-tertiary" style="font-size:11.5px;">${filtered.length} de ${allPacientes.length} pacientes</div>
        <div class="patient-directory" id="patient-directory"></div>
      </div>
    </div>
    <div id="patient-detail"></div>
    <div id="patient-timeline"></div>
  `;

  renderDirectory(filtered, paciente?.id);
  renderDetail(paciente);
  renderTimeline(paciente);

  const searchInput = document.getElementById('paciente-search');
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value;
    const url = paciente ? `#/pacientes/${paciente.id}` : '#/pacientes';
    navigateTo(`${url}?q=${encodeURIComponent(term)}`);
  });
}

function renderDirectory(list, selectedId) {
  const el = document.getElementById('patient-directory');
  if (!list.length) {
    el.innerHTML = '<div class="empty-state">Sin resultados.</div>';
    return;
  }
  el.innerHTML = list
    .map((p) => {
      const age = calcAge(p.fechaNacimiento);
      return `
        <a class="patient-directory-item${p.id === selectedId ? ' is-active' : ''}" href="#/pacientes/${p.id}">
          <span class="avatar-initials" style="width:36px;height:36px;">${initials(p.nombre + ' ' + p.apellidos)}</span>
          <div style="min-width:0;">
            <div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(p.nombre)} ${escapeHtml(p.apellidos)}</div>
            <div class="text-tertiary" style="font-size:11.5px;">${age} años · ${escapeHtml(p.id)}</div>
          </div>
        </a>
      `;
    })
    .join('');
}

function renderDetail(paciente) {
  const el = document.getElementById('patient-detail');
  if (!paciente) {
    el.innerHTML = cardHtml({ bodyHtml: '<div class="empty-state">Selecciona un paciente del directorio.</div>' });
    return;
  }

  const age = calcAge(paciente.fechaNacimiento);

  const tabs = createTabs({
    tabs: [
      { id: 'resumen', label: 'Resumen' },
      { id: 'contacto', label: 'Contacto & Seguros' },
      { id: 'antecedentes', label: 'Antecedentes' },
      { id: 'alertas', label: `Alertas (${paciente.alertas.length})` }
    ],
    activeId: 'resumen',
    panelHtml: (tabId) => buildPanel(tabId, paciente)
  });

  el.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'card';
  header.innerHTML = `
    <div style="display:flex; gap:16px; align-items:flex-start; flex-wrap:wrap;">
      <span class="avatar-initials" style="width:64px;height:64px;font-size:20px;">${initials(paciente.nombre + ' ' + paciente.apellidos)}</span>
      <div style="flex:1; min-width:200px;">
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <h2 style="font-size:18px;">${escapeHtml(paciente.nombre)} ${escapeHtml(paciente.apellidos)}</h2>
        </div>
        <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
          <span class="badge badge-primary">${age} años</span>
          <span class="badge">${escapeHtml(paciente.sexo)}</span>
          <span class="badge badge-accent">Grupo ${escapeHtml(paciente.grupoSanguineo)}</span>
          <span class="badge badge-success">${escapeHtml(paciente.estado === 'activo' ? 'Asegurado' : 'Inactivo')}</span>
        </div>
        <div class="text-tertiary" style="font-size:12px; margin-top:6px;">ID Paciente: ${escapeHtml(paciente.id)}</div>
      </div>
      <div class="view-actions">
        <a class="btn btn-secondary btn-sm" href="#/historia-clinica/${paciente.id}">📄 Historia Clínica</a>
        <a class="btn btn-primary btn-sm" href="#/consulta/${paciente.id}">🩺 Nueva consulta</a>
      </div>
    </div>
    <div class="view-actions" style="margin-top:14px;">
      <a class="btn btn-secondary btn-sm" href="#/recetas?pacienteId=${paciente.id}">💊 Receta</a>
      <a class="btn btn-secondary btn-sm" href="#/documentos?pacienteId=${paciente.id}">🖼️ Documentos</a>
      <a class="btn btn-secondary btn-sm" href="#/agenda?pacienteId=${paciente.id}">📅 Agenda</a>
    </div>
  `;
  el.appendChild(header);
  el.appendChild(tabs.el);
  activeTabs = tabs;
}

function buildPanel(tabId, paciente) {
  if (tabId === 'resumen') {
    return `
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Fecha de nacimiento</div><div class="info-value">${formatDate(paciente.fechaNacimiento)}</div></div>
        <div class="info-item"><div class="info-label">Estado civil</div><div class="info-value">${escapeHtml(paciente.estadoCivil)}</div></div>
        <div class="info-item"><div class="info-label">CURP</div><div class="info-value">${escapeHtml(paciente.curp)}</div></div>
        <div class="info-item"><div class="info-label">NSS</div><div class="info-value">${escapeHtml(paciente.nss)}</div></div>
      </div>
      <hr class="divider" style="margin:16px 0;" />
      <div class="info-item">
        <div class="info-label">Alergias y reacciones</div>
        <div class="stack" style="gap:6px; margin-top:6px;">
          ${
            paciente.alergias.length
              ? paciente.alergias
                  .map((a) => `<div><span class="badge badge-danger">${escapeHtml(a.sustancia)}</span> <span class="text-tertiary" style="font-size:12px;">Reacción: ${escapeHtml(a.reaccion)}</span></div>`)
                  .join('')
              : '<span class="text-tertiary">Sin alergias registradas.</span>'
          }
        </div>
      </div>
    `;
  }
  if (tabId === 'contacto') {
    return `
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Email</div><div class="info-value">${escapeHtml(paciente.contacto.email)}</div></div>
        <div class="info-item"><div class="info-label">Teléfono</div><div class="info-value">${escapeHtml(paciente.contacto.telefono)}</div></div>
        <div class="info-item"><div class="info-label">Domicilio</div><div class="info-value">${escapeHtml(paciente.contacto.direccion)}</div></div>
        <div class="info-item"><div class="info-label">Contacto de emergencia</div><div class="info-value">${escapeHtml(paciente.contactoEmergencia.nombre)} (${escapeHtml(paciente.contactoEmergencia.parentesco)})</div></div>
      </div>
      <hr class="divider" style="margin:16px 0;" />
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Aseguradora</div><div class="info-value">${escapeHtml(paciente.aseguradora.compania)}</div></div>
        <div class="info-item"><div class="info-label">Póliza</div><div class="info-value">${escapeHtml(paciente.aseguradora.poliza)}</div></div>
        <div class="info-item"><div class="info-label">Plan</div><div class="info-value">${escapeHtml(paciente.aseguradora.plan)}</div></div>
        <div class="info-item"><div class="info-label">Vigencia</div><div class="info-value">${formatDate(paciente.aseguradora.vigenciaInicio)} – ${formatDate(paciente.aseguradora.vigenciaFin)}</div></div>
      </div>
    `;
  }
  if (tabId === 'antecedentes') {
    const consultas = queryCollection('consultas', (c) => c.pacienteId === paciente.id).sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );
    const ultima = consultas[0];
    if (!ultima) return '<div class="empty-state">Sin antecedentes registrados todavía.</div>';
    return `
      <div class="stack">
        <div class="info-item"><div class="info-label">Heredofamiliares</div><div class="info-value">${escapeHtml(ultima.antecedentes.heredofamiliares || 'Sin información')}</div></div>
        <div class="info-item"><div class="info-label">Personales patológicos</div><div class="info-value">${escapeHtml(ultima.antecedentes.personalesPatologicos || 'Sin información')}</div></div>
        <div class="info-item"><div class="info-label">Personales no patológicos</div><div class="info-value">${escapeHtml(ultima.antecedentes.personalesNoPatologicos || 'Sin información')}</div></div>
      </div>
    `;
  }
  if (tabId === 'alertas') {
    if (!paciente.alertas.length) return '<div class="empty-state">Sin alertas clínicas activas.</div>';
    return `
      <div class="stack">
        ${paciente.alertas
          .map(
            (a) => `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border-color);">
            <div>
              <div style="font-size:13px; font-weight:600;">${escapeHtml(a.tipo)}</div>
              <div class="text-tertiary" style="font-size:12px;">${escapeHtml(a.descripcion)}</div>
            </div>
            <span class="badge ${a.activa ? 'badge-warning' : ''}">${a.activa ? 'Activa' : 'Resuelta'}</span>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }
  return '';
}

function renderTimeline(paciente) {
  const el = document.getElementById('patient-timeline');
  if (!paciente) {
    el.innerHTML = '';
    return;
  }

  const consultas = queryCollection('consultas', (c) => c.pacienteId === paciente.id).map((c) => ({
    date: c.fecha,
    label: `Consulta: ${c.motivoConsulta}`,
    badge: 'Consulta',
    tone: 'badge-primary'
  }));
  const recetas = queryCollection('recetas', (r) => r.pacienteId === paciente.id).map((r) => ({
    date: r.fecha,
    label: `Receta ${r.folio}`,
    badge: 'Prescripción',
    tone: 'badge-accent'
  }));
  const documentos = queryCollection('documentos', (d) => d.pacienteId === paciente.id).map((d) => ({
    date: d.fecha,
    label: d.nombre,
    badge: 'Documento',
    tone: 'badge-info'
  }));

  const items = [...consultas, ...recetas, ...documentos]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  el.innerHTML = cardHtml({
    title: 'Línea de tiempo',
    bodyHtml: items.length
      ? `<div class="timeline">
          ${items
            .map(
              (item) => `
            <div class="timeline-item">
              <div class="text-tertiary" style="font-size:11px;">${formatDate(item.date, { withTime: true })}</div>
              <div style="font-size:13px; font-weight:500;">${escapeHtml(item.label)}</div>
              <span class="badge ${item.tone}" style="margin-top:4px;">${item.badge}</span>
            </div>
          `
            )
            .join('')}
        </div>`
      : '<div class="empty-state">Sin actividad registrada.</div>'
  });
}

function openNuevoPacienteModal() {
  const bodyHtml = `
    <form id="form-nuevo-paciente" class="form-grid">
      ${textField({ name: 'nombre', label: 'Nombre(s)', required: true })}
      ${textField({ name: 'apellidos', label: 'Apellidos', required: true })}
      ${textField({ name: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date', required: true })}
      ${selectField({ name: 'sexo', label: 'Sexo', options: ['Masculino', 'Femenino'], required: true })}
      ${selectField({ name: 'estadoCivil', label: 'Estado civil', options: ['Soltero(a)', 'Casado(a)', 'Divorciado(a)', 'Viudo(a)'] })}
      ${selectField({ name: 'grupoSanguineo', label: 'Grupo sanguíneo', options: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] })}
      ${textField({ name: 'email', label: 'Email', type: 'email' })}
      ${textField({ name: 'telefono', label: 'Teléfono', required: true })}
    </form>
  `;

  openModal({
    title: 'Nuevo paciente',
    bodyHtml,
    footerHtml: `
      <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="modal-save">Guardar paciente</button>
    `,
    onMount: (modalEl, close) => {
      modalEl.querySelector('#modal-cancel').addEventListener('click', close);
      modalEl.querySelector('#modal-save').addEventListener('click', async () => {
        const form = modalEl.querySelector('#form-nuevo-paciente');
        if (!validateRequired(form)) return;
        const data = getFormData(form);
        const nuevo = await create('pacientes', {
          nombre: data.nombre,
          apellidos: data.apellidos,
          fechaNacimiento: data.fechaNacimiento,
          sexo: data.sexo,
          estadoCivil: data.estadoCivil || 'No especificado',
          grupoSanguineo: data.grupoSanguineo || 'No especificado',
          curp: 'No registrado',
          nss: 'No registrado',
          foto: '',
          contacto: { email: data.email || '', telefono: data.telefono, telefonoAlt: '', direccion: 'No registrado' },
          aseguradora: { compania: 'Particular', poliza: '', vigenciaInicio: '', vigenciaFin: '', plan: '' },
          contactoEmergencia: { nombre: '', parentesco: '', telefono: '' },
          alergias: [],
          alertas: [],
          estado: 'activo',
          fechaRegistro: new Date().toISOString().slice(0, 10)
        });
        close();
        navigateTo(`#/pacientes/${nuevo.id}`);
      });
    }
  });
}

export function unmount() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  activeTabs = null;
}
