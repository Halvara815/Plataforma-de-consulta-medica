import { cardHtml } from '../components/card.js';
import { setTopbarTitle } from '../components/topbar.js';
import { showToast } from '../components/toast.js';
import { downloadDocument, getAll, getById, remove, restoreDocument, update, uploadDocument, userFacingApiError } from '../services/dataService.js';
import { escapeHtml, formatBytes, formatDate, downloadBlob } from '../utils.js';
import { icon } from '../icons.js';

const CATEGORIAS = [
  'Radiografía', 'Resonancia', 'Tomografía', 'Ecografía', 'Fotografía clínica',
  'Laboratorio', 'Receta', 'Consentimiento', 'Informe médico', 'Electrocardiograma',
  'Evolución', 'Nota', 'Otro',
];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp', 'txt', 'csv', 'doc', 'docx', 'xls', 'xlsx']);

let container;
let patients = [];
let state = { pacienteId: '', documentos: [], selectedId: null, estado: 'activo' };
let patientContextMessage = '';
let patientSearchTimer = null;
let patientSearchRequest = 0;

export async function mount(element, params = {}, query = {}) {
  container = element;
  setTopbarTitle('Imágenes / Documentos', 'Archivos clínicos protegidos por paciente');
  patients = await getAll('pacientes', { page: 1, limit: 100, estado: 'activo' });
  const requestedPatientId = query.pacienteId || '';
  let requestedPatient = patients.find((patient) => patient.id === requestedPatientId);
  if (requestedPatientId && !requestedPatient) {
    requestedPatient = await getById('pacientes', requestedPatientId).catch(() => null);
    if (requestedPatient?.estado === 'activo') patients = [requestedPatient, ...patients];
  }
  const hasRequestedPatient = requestedPatient?.estado === 'activo';
  patientContextMessage = requestedPatientId && !hasRequestedPatient
    ? 'El paciente solicitado no está disponible. Selecciona un paciente activo para consultar sus documentos.'
    : '';
  state = {
    pacienteId: hasRequestedPatient ? requestedPatientId : '',
    documentos: [],
    selectedId: null,
    estado: query.estado === 'eliminado' ? 'eliminado' : 'activo',
  };
  renderShell();
  bindShellEvents();
  if (state.pacienteId) await loadDocuments();
}

function patientOptions(filter = '') {
  const normalizedFilter = filter.trim().toLocaleLowerCase();
  const visiblePatients = normalizedFilter
    ? patients.filter((patient) => `${patient.nombre} ${patient.apellidos}`.toLocaleLowerCase().includes(normalizedFilter))
    : patients;
  const selectedPatient = state.pacienteId && !visiblePatients.some((patient) => patient.id === state.pacienteId)
    ? patients.find((patient) => patient.id === state.pacienteId)
    : null;
  return [
    "<option value=''>Selecciona un paciente para consultar sus documentos</option>",
    ...(selectedPatient ? [selectedPatient] : []),
    ...visiblePatients,
  ].map((patient) => {
    if (!patient.id) return patient;
    const selected = patient.id === state.pacienteId ? ' selected' : '';
    return "<option value='" + escapeHtml(patient.id) + "'" + selected + ">" +
      escapeHtml(patient.nombre + ' ' + patient.apellidos) + '</option>';
  }).join('');
}

function renderShell() {
  const categoryOptions = CATEGORIAS
    .map((category) => "<option value='" + escapeHtml(category) + "'>" + escapeHtml(category) + '</option>')
    .join('');

  container.innerHTML = [
    "<div class='view'>",
    "  <div class='view-header'>",
    "    <div><h1>Imágenes / Documentos</h1><p>La carga se almacena en el backend y queda vinculada al expediente seleccionado.</p></div>",
    '  </div>',
    "  <div class='card'>",
    "    <div class='card-header'><div><h2>Cargar archivo clínico</h2><p class='text-tertiary' style='font-size:12px; font-weight:400; margin-top:4px;'>Asocia el archivo al expediente correcto antes de cargarlo.</p></div></div>",
    patientContextMessage ? "    <div class='empty-state' role='status' style='padding:10px; text-align:left;'>" + escapeHtml(patientContextMessage) + '</div>' : '',
    "    <div class='form-grid' style='max-width:760px; margin-bottom:16px;'>",
    "      <div class='form-field'><label for='document-patient-search'>Buscar paciente</label><input class='input' id='document-patient-search' type='search' autocomplete='off' placeholder='Nombre o apellido' /><span class='hint'>Filtra la lista de expedientes disponibles.</span></div>",
    "      <div class='form-field'><label for='document-patient'>Paciente</label><select class='input' id='document-patient'>" + patientOptions() + "</select><span class='hint'>La lista y el formulario se actualizan al seleccionar un expediente.</span></div>",
    '    </div>',
    "    <form id='document-upload-form' class='form-grid'>",
    "      <div class='form-field span-2'><label for='document-file'>Archivo</label><input class='input' id='document-file' name='file' type='file' required accept='.pdf,.jpg,.jpeg,.png,.webp,.txt,.csv,.doc,.docx,.xls,.xlsx' /><span class='hint'>Máximo 10 MB. Se permiten PDF, imágenes y documentos ofimáticos.</span></div>",
    "      <div class='form-field'><label for='document-category'>Categoría</label><select class='input' id='document-category' name='categoria' required>" + categoryOptions + '</select></div>',
    "      <div class='form-field'><label for='document-tags'>Etiquetas</label><input class='input' id='document-tags' name='tags' maxlength='300' placeholder='control, laboratorio' /><span class='hint'>Separa las etiquetas con comas.</span></div>",
    "      <div class='form-field span-2'><label for='document-description'>Descripción</label><textarea class='input' id='document-description' name='descripcion' rows='3' maxlength='2000' placeholder='Descripción clínica opcional'></textarea></div>",
    "      <div class='form-field span-2'><div class='view-actions'><button class='btn btn-primary' type='submit' data-role='upload-submit'" + (state.pacienteId ? '' : ' disabled') + ">" + icon('upload', { size: 16 }) + " Cargar archivo</button><span class='text-tertiary' data-role='upload-status' style='font-size:12px;'>Selecciona un paciente y un archivo para continuar.</span></div></div>",
    '    </form>',
    '  </div>',
    "  <div class='two-col'>",
    "    <section class='card'><div class='card-header'><div><h2>Archivos del expediente</h2><p class='text-tertiary' style='font-size:12px; font-weight:400; margin-top:4px;'>Consulta los archivos activos o recupera los archivados.</p></div></div><div class='view-actions' data-role='document-status-tabs'><button type='button' class='btn btn-sm " + (state.estado === 'activo' ? 'btn-primary' : 'btn-secondary') + "' data-document-status='activo'>Activos</button><button type='button' class='btn btn-sm " + (state.estado === 'eliminado' ? 'btn-primary' : 'btn-secondary') + "' data-document-status='eliminado'>Archivados</button></div><div id='document-list' style='margin-top:16px;'></div></section>",
    "    <section id='document-detail'></section>",
    '  </div>',
    '</div>',
  ].join('');
}

function bindShellEvents() {
  container.querySelector('#document-patient-search').addEventListener('input', (event) => {
    window.clearTimeout(patientSearchTimer);
    patientSearchTimer = window.setTimeout(() => {
      refreshPatientOptions(event.target.value);
    }, 250);
  });

  container.querySelector('#document-patient').addEventListener('change', async (event) => {
    state.pacienteId = event.target.value;
    state.selectedId = null;
    container.querySelector('[data-role="upload-submit"]').disabled = !state.pacienteId;
    container.querySelector('[data-role="upload-status"]').textContent = state.pacienteId
      ? 'Selecciona un archivo para cargarlo en este expediente.'
      : 'Selecciona un paciente y un archivo para continuar.';
    await loadDocuments();
  });

  container.querySelectorAll('[data-document-status]').forEach((button) => {
    button.addEventListener('click', async () => {
      const nextStatus = button.dataset.documentStatus;
      if (nextStatus === state.estado) return;
      state.estado = nextStatus;
      state.selectedId = null;
      syncDocumentStatusButtons();
      await loadDocuments();
    });
  });

  container.querySelector('#document-upload-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.pacienteId) {
      showToast({ message: 'Selecciona primero el paciente del expediente.', tone: 'warning' });
      return;
    }
    const form = event.currentTarget;
    const file = form.elements.file.files?.[0];
    const status = container.querySelector('[data-role="upload-status"]');
    const submit = form.querySelector('button[type="submit"]');
    if (!file) {
      status.textContent = 'Selecciona un archivo.';
      return;
    }
    const validationMessage = validateFile(file);
    if (validationMessage) {
      status.textContent = validationMessage;
      return;
    }

    submit.disabled = true;
    status.textContent = 'Cargando y validando archivo…';
    try {
      const data = new FormData(form);
      const documento = await uploadDocument({
        pacienteId: state.pacienteId,
        categoria: data.get('categoria'),
        tags: data.get('tags'),
        descripcion: data.get('descripcion'),
      }, file);
      form.reset();
      state.estado = 'activo';
      state.selectedId = documento.id;
      syncDocumentStatusButtons();
      await loadDocuments();
      showToast({ message: 'Archivo cargado y registrado correctamente.', tone: 'success' });
    } catch (error) {
      status.textContent = userFacingApiError(error);
    } finally {
      submit.disabled = false;
    }
  });
}

async function refreshPatientOptions(searchTerm) {
  const requestId = ++patientSearchRequest;
  const selectedPatient = patients.find((patient) => patient.id === state.pacienteId);
  try {
    const q = searchTerm.trim();
    const results = await getAll('pacientes', {
      page: 1,
      limit: q ? 50 : 100,
      estado: 'activo',
      q: q || undefined,
    });
    if (requestId !== patientSearchRequest || !container) return;
    patients = selectedPatient && !results.some((patient) => patient.id === selectedPatient.id)
      ? [selectedPatient, ...results]
      : results;
    const selector = container.querySelector('#document-patient');
    selector.innerHTML = patientOptions();
    selector.value = state.pacienteId;
  } catch (error) {
    if (requestId === patientSearchRequest) {
      showToast({ message: userFacingApiError(error), tone: 'danger' });
    }
  }
}

function validateFile(file) {
  if (file.size > MAX_UPLOAD_BYTES) return 'El archivo supera el máximo permitido de 10 MB.';
  const extension = file.name.split('.').pop()?.toLocaleLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
    return 'Selecciona un PDF, imagen o documento ofimático permitido.';
  }
  return '';
}

function syncDocumentStatusButtons() {
  container.querySelectorAll('[data-document-status]').forEach((button) => {
    const isActive = button.dataset.documentStatus === state.estado;
    button.classList.toggle('btn-primary', isActive);
    button.classList.toggle('btn-secondary', !isActive);
  });
}

async function loadDocuments() {
  const list = container.querySelector('#document-list');
  const detail = container.querySelector('#document-detail');
  if (!state.pacienteId) {
    state.documentos = [];
    list.innerHTML = "<div class='empty-state'>Selecciona un paciente para ver sus archivos.</div>";
    detail.innerHTML = '';
    return;
  }

  list.innerHTML = "<div class='loading-state'>Cargando documentos…</div>";
  try {
    state.documentos = await getAll('documentos', { pacienteId: state.pacienteId, estado: state.estado });
    if (!state.documentos.some((documento) => documento.id === state.selectedId)) {
      state.selectedId = state.documentos[0]?.id || null;
    }
    renderDocuments();
  } catch (error) {
    list.innerHTML = "<div class='empty-state' role='alert'>" + escapeHtml(userFacingApiError(error)) + '</div>';
    detail.innerHTML = '';
  }
}

function renderDocuments() {
  const list = container.querySelector('#document-list');
  const detail = container.querySelector('#document-detail');
  if (!state.documentos.length) {
    const message = state.estado === 'eliminado'
      ? 'No hay documentos archivados para este expediente.'
      : 'Este expediente todavía no tiene documentos activos.';
    list.innerHTML = "<div class='empty-state'>" + message + '</div>';
    detail.innerHTML = '';
    return;
  }

  list.innerHTML = [
    "<div class='section-header' style='padding-bottom:10px;'><strong>" + (state.estado === 'eliminado' ? 'Archivados' : 'Documentos activos') + ' (' + state.documentos.length + ")</strong><span class='badge " + (state.estado === 'eliminado' ? 'badge-warning' : 'badge-success') + "'>" + (state.estado === 'eliminado' ? 'Retenidos' : 'Disponibles') + '</span></div>',
    "<div class='patient-directory'>",
    state.documentos.map((documento) => {
      const selected = documento.id === state.selectedId ? ' is-active' : '';
      const iconName = documento.tipo === 'imagen' ? 'image' : 'file-text';
      return [
        "<button type='button' class='patient-directory-item" + selected + "' data-document-id='" + escapeHtml(documento.id) + "' style='width:100%; text-align:left; border:0;'>",
        "  <span class='file-type-icon'>" + icon(iconName, { size: 18 }) + '</span>',
        "  <span style='min-width:0; flex:1;'><strong style='display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;'>" + escapeHtml(documento.nombre) + "</strong><small class='text-tertiary'>" + escapeHtml(documento.categoria) + ' · ' + escapeHtml(documento.tamano || formatBytes(documento.sizeBytes)) + '</small></span>',
        '</button>',
      ].join('');
    }).join(''),
    '</div>',
  ].join('');

  list.querySelectorAll('[data-document-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedId = button.dataset.documentId;
      renderDocuments();
    });
  });

  renderDetail(detail, state.documentos.find((documento) => documento.id === state.selectedId));
}

function renderDetail(detail, documento) {
  if (!documento) {
    detail.innerHTML = '';
    return;
  }
  const categoryOptions = CATEGORIAS.map((category) => {
    const selected = category === documento.categoria ? " selected" : "";
    return "<option value='" + escapeHtml(category) + "'" + selected + '>' + escapeHtml(category) + '</option>';
  }).join('');
  const size = documento.tamano || formatBytes(documento.sizeBytes);
  const isArchived = documento.estado === 'eliminado';
  const actionsHtml = isArchived
    ? "<button type='button' class='btn btn-primary btn-sm' data-action='restore-document'>" + icon('refresh', { size: 14 }) + ' Restaurar</button>'
    : "<button type='button' class='btn btn-secondary btn-sm' data-action='download-document'>" + icon('download', { size: 14 }) + " Descargar</button><button type='button' class='btn btn-danger btn-sm' data-action='delete-document'>" + icon('trash', { size: 14 }) + ' Eliminar</button>';
  const editorHtml = isArchived
    ? "<div class='empty-state' style='margin-top:16px; padding:14px; text-align:left;'>Este archivo está archivado para trazabilidad. Restáuralo para descargarlo o modificar sus metadatos.</div>"
    : [
      "<form id='document-edit-form' class='form-grid' style='margin-top:16px;'>",
      "<label class='form-field'>Categoría<select class='form-input' name='categoria'>" + categoryOptions + '</select></label>',
      "<label class='form-field'>Etiquetas<input class='form-input' name='tags' maxlength='300' value='" + escapeHtml((documento.tags || []).join(', ')) + "' /></label>",
      "<label class='form-field span-2'>Descripción<textarea class='form-input' name='descripcion' rows='3' maxlength='2000'>" + escapeHtml(documento.descripcion || '') + '</textarea></label>',
      "<div class='span-2'><button class='btn btn-secondary' type='submit'>Guardar metadatos</button><span class='text-tertiary' data-role='edit-status' style='margin-left:8px; font-size:12px;'></span></div>",
      '</form>',
    ].join('');

  detail.innerHTML = cardHtml({
    title: escapeHtml(documento.nombre),
    actionsHtml,
    bodyHtml: [
      "<div class='info-grid'>",
      "<div class='info-item'><div class='info-label'>Categoría</div><div class='info-value'>" + escapeHtml(documento.categoria) + '</div></div>',
      "<div class='info-item'><div class='info-label'>Tamaño</div><div class='info-value'>" + escapeHtml(size || '—') + '</div></div>',
      "<div class='info-item'><div class='info-label'>Tipo</div><div class='info-value'>" + escapeHtml(documento.mimeType || documento.tipo) + '</div></div>',
      "<div class='info-item'><div class='info-label'>Fecha</div><div class='info-value'>" + escapeHtml(formatDate(documento.fecha, { withTime: true })) + '</div></div>',
      "<div class='info-item'><div class='info-label'>Estado</div><div class='info-value'>" + (isArchived ? 'Archivado' : 'Activo') + '</div></div>',
      '</div>',
      editorHtml,
    ].join(''),
  });

  detail.querySelector('[data-action="download-document"]')?.addEventListener('click', async () => {
    try {
      const { blob } = await downloadDocument(documento.id);
      downloadBlob(blob, documento.nombre);
    } catch (error) {
      showToast({ message: userFacingApiError(error), tone: 'danger' });
    }
  });

  detail.querySelector('[data-action="delete-document"]')?.addEventListener('click', async () => {
    if (!window.confirm('¿Dar de baja este documento? Se conservará para la trazabilidad administrativa.')) return;
    try {
      await remove('documentos', documento.id);
      state.estado = 'eliminado';
      state.selectedId = documento.id;
      syncDocumentStatusButtons();
      await loadDocuments();
      showToast({ message: 'Documento archivado. Puedes restaurarlo cuando sea necesario.', tone: 'success' });
    } catch (error) {
      showToast({ message: userFacingApiError(error), tone: 'danger' });
    }
  });

  detail.querySelector('[data-action="restore-document"]')?.addEventListener('click', async () => {
    try {
      const restored = await restoreDocument(documento.id);
      state.estado = 'activo';
      state.selectedId = restored.id;
      syncDocumentStatusButtons();
      await loadDocuments();
      showToast({ message: 'Documento restaurado y disponible nuevamente.', tone: 'success' });
    } catch (error) {
      showToast({ message: userFacingApiError(error), tone: 'danger' });
    }
  });

  detail.querySelector('#document-edit-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector('[data-role="edit-status"]');
    const data = new FormData(form);
    try {
      status.textContent = 'Guardando…';
      await update('documentos', documento.id, {
        categoria: data.get('categoria'),
        tags: String(data.get('tags') || '').split(',').map((tag) => tag.trim()).filter(Boolean),
        descripcion: data.get('descripcion'),
      });
      await loadDocuments();
      showToast({ message: 'Metadatos actualizados.', tone: 'success' });
    } catch (error) {
      status.textContent = userFacingApiError(error);
    }
  });
}

export function unmount() {
  window.clearTimeout(patientSearchTimer);
  container = null;
  patients = [];
  state = { pacienteId: '', documentos: [], selectedId: null, estado: 'activo' };
  patientContextMessage = '';
  patientSearchTimer = null;
  patientSearchRequest = 0;
}
