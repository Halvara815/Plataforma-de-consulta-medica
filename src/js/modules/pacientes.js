import { getAll, getById, create, query as queryCollection } from '../services/dataService.js';
import { setTopbarTitle } from '../components/topbar.js';
import { cardHtml } from '../components/card.js';
import { createSectionNav } from '../components/sectionNav.js';
import { openModal } from '../components/modal.js';
import { textField, selectField, getFormData, validateRequired } from '../components/form.js';
import { navigateTo } from '../router.js';
import { calcAge, escapeHtml, formatDate, initials } from '../utils.js';
import { icon } from '../icons.js';

import * as pacienteDashboard from './paciente/dashboard.js';
import * as pacienteDatosGenerales from './paciente/datosGenerales.js';
import * as pacienteHistorialClinico from './paciente/historialClinico.js';
import * as pacienteConsultas from './paciente/consultas.js';
import * as pacienteDiagnosticos from './paciente/diagnosticos.js';
import * as pacienteTratamientos from './paciente/tratamientos.js';
import * as pacienteMedicamentos from './paciente/medicamentos.js';
import * as pacienteAlergias from './paciente/alergias.js';
import * as pacienteSignosVitales from './paciente/signosVitales.js';
import * as pacienteLaboratorios from './paciente/laboratorios.js';
import * as pacienteImagenesMedicas from './paciente/imagenesMedicas.js';
import * as pacienteDocumentos from './paciente/documentos.js';
import * as pacienteCitas from './paciente/citas.js';
import * as pacienteReferencias from './paciente/referencias.js';
import * as pacienteConfiguracion from './paciente/configuracion.js';

const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard del paciente', icon: 'dashboard', mod: pacienteDashboard },
  { id: 'datosGenerales', label: 'Datos generales', icon: 'id-card', mod: pacienteDatosGenerales },
  { id: 'historialClinico', label: 'Historial clínico', icon: 'history', mod: pacienteHistorialClinico },
  { id: 'consultas', label: 'Consultas', icon: 'clipboard-list', mod: pacienteConsultas },
  { id: 'diagnosticos', label: 'Diagnósticos', icon: 'stethoscope', mod: pacienteDiagnosticos },
  { id: 'tratamientos', label: 'Tratamientos', icon: 'syringe', mod: pacienteTratamientos },
  { id: 'medicamentos', label: 'Medicamentos', icon: 'pill', mod: pacienteMedicamentos },
  { id: 'alergias', label: 'Alergias', icon: 'droplet', mod: pacienteAlergias },
  { id: 'signosVitales', label: 'Signos vitales', icon: 'activity', mod: pacienteSignosVitales },
  { id: 'laboratorios', label: 'Laboratorios', icon: 'flask', mod: pacienteLaboratorios },
  { id: 'imagenesMedicas', label: 'Imágenes médicas', icon: 'image', mod: pacienteImagenesMedicas },
  { id: 'documentos', label: 'Documentos', icon: 'documents', mod: pacienteDocumentos },
  { id: 'citas', label: 'Citas', icon: 'calendar', mod: pacienteCitas },
  { id: 'referencias', label: 'Referencias', icon: 'link', mod: pacienteReferencias },
  { id: 'configuracion', label: 'Configuración', icon: 'settings', mod: pacienteConfiguracion }
];

let cleanupFns = [];
let activeSectionNav = null;

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
          <button type="button" class="btn btn-primary" id="btn-nuevo-paciente">${icon('plus', { size: 15 })} Nuevo paciente</button>
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
          ${icon('search', { size: 16 })}
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
  if (activeSectionNav) {
    activeSectionNav.destroy();
    activeSectionNav = null;
  }
  if (!paciente) {
    el.innerHTML = cardHtml({ bodyHtml: '<div class="empty-state">Selecciona un paciente del directorio.</div>' });
    return;
  }

  const age = calcAge(paciente.fechaNacimiento);

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
        <a class="btn btn-secondary btn-sm" href="#/historia-clinica/${paciente.id}">${icon('history', { size: 14 })} Historia Clínica</a>
        <a class="btn btn-primary btn-sm" href="#/consulta/${paciente.id}">${icon('stethoscope', { size: 14 })} Nueva consulta</a>
      </div>
    </div>
    <div class="view-actions" style="margin-top:14px;">
      <a class="btn btn-secondary btn-sm" href="#/recetas?pacienteId=${paciente.id}">${icon('pill', { size: 14 })} Receta</a>
      <a class="btn btn-secondary btn-sm" href="#/documentos?pacienteId=${paciente.id}">${icon('image', { size: 14 })} Documentos</a>
      <a class="btn btn-secondary btn-sm" href="#/agenda?pacienteId=${paciente.id}">${icon('calendar', { size: 14 })} Agenda</a>
    </div>
  `;
  el.appendChild(header);

  const sectionNavContainer = document.createElement('div');
  sectionNavContainer.className = 'card';
  el.appendChild(sectionNavContainer);

  const ctx = {
    refresh() {
      const fresh = getById('pacientes', paciente.id);
      const previousActive = activeSectionNav?.getActive();
      renderDetail(fresh);
      if (previousActive && activeSectionNav) activeSectionNav.setActive(previousActive);
      renderTimeline(fresh);
    }
  };

  activeSectionNav = createSectionNav({
    items: SECTIONS,
    activeId: 'dashboard',
    ariaLabel: 'Secciones del expediente del paciente',
    renderPanel: (id, panelEl) => {
      const section = SECTIONS.find((s) => s.id === id);
      const fresh = getById('pacientes', paciente.id) || paciente;
      return section.mod.render(fresh, panelEl, ctx);
    }
  });
  sectionNavContainer.appendChild(activeSectionNav.el);
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
          referencias: [],
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
  if (activeSectionNav) {
    activeSectionNav.destroy();
    activeSectionNav = null;
  }
}
