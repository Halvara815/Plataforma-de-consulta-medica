import { getAll, getById, create, remove } from '../services/dataService.js';
import { setTopbarTitle } from '../components/topbar.js';
import { cardHtml } from '../components/card.js';
import { openModal } from '../components/modal.js';
import { textField, selectField, textareaField, getFormData, validateRequired } from '../components/form.js';
import { escapeHtml, formatDate } from '../utils.js';

const TIPO_ICONS = { imagen: '🩻', documento: '📄', nota: '📝' };

let cleanupFns = [];
let state = { tipo: 'todos', search: '', selectedId: null, pacienteFiltro: null };

export async function mount(container, params = {}, query = {}) {
  setTopbarTitle('Imágenes / Documentos', 'Visualice, administre y prescriba desde un solo lugar');
  state = { tipo: 'todos', search: '', selectedId: null, pacienteFiltro: query.pacienteId || null };

  container.innerHTML = `
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Imágenes / Documentos Médicos</h1>
          <p>Visualice, administre y organice estudios, imágenes y documentos clínicos.</p>
        </div>
        <div class="view-actions">
          <button type="button" class="btn btn-primary" id="btn-subir-archivo">📤 Subir archivo</button>
        </div>
      </div>
      <div class="two-col">
        <div class="card">
          <div class="stack" style="gap:10px;">
            <div class="table-search">
              <span aria-hidden="true">🔍</span>
              <input type="search" id="doc-search" placeholder="Buscar archivos…" />
            </div>
            <div class="tabs" role="tablist" id="doc-type-tabs">
              ${['todos', 'imagen', 'documento', 'nota']
                .map(
                  (t) =>
                    `<button type="button" class="tab-btn${t === 'todos' ? ' is-active' : ''}" data-tipo="${t}">${t === 'todos' ? 'Todos' : t === 'imagen' ? 'Imágenes' : t === 'documento' ? 'Documentos' : 'Notas'}</button>`
                )
                .join('')}
            </div>
            <div class="patient-directory" id="doc-list"></div>
          </div>
        </div>
        <div class="stack">
          <div id="doc-viewer"></div>
          <div id="doc-info"></div>
        </div>
      </div>
    </div>
  `;

  render();

  document.getElementById('btn-subir-archivo').addEventListener('click', openSubirModal);
  document.getElementById('doc-search').addEventListener('input', (e) => {
    state.search = e.target.value;
    render();
  });
  document.getElementById('doc-type-tabs').addEventListener('click', (e) => {
    if (!e.target.matches('[data-tipo]')) return;
    state.tipo = e.target.dataset.tipo;
    document.querySelectorAll('#doc-type-tabs .tab-btn').forEach((b) => b.classList.toggle('is-active', b === e.target));
    render();
  });

  if (query.action === 'subir') openSubirModal();
}

function getFilteredDocs() {
  let docs = getAll('documentos');
  if (state.pacienteFiltro) docs = docs.filter((d) => d.pacienteId === state.pacienteFiltro);
  if (state.tipo !== 'todos') docs = docs.filter((d) => d.tipo === state.tipo);
  if (state.search) {
    const term = state.search.toLowerCase();
    docs = docs.filter((d) => `${d.nombre} ${d.categoria} ${d.tags.join(' ')}`.toLowerCase().includes(term));
  }
  return [...docs].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

function render() {
  const docs = getFilteredDocs();
  if (!state.selectedId || !docs.some((d) => d.id === state.selectedId)) {
    state.selectedId = docs[0]?.id || null;
  }
  renderList(docs);
  renderViewer(docs.find((d) => d.id === state.selectedId));
}

function renderList(docs) {
  const el = document.getElementById('doc-list');
  if (!docs.length) {
    el.innerHTML = '<div class="empty-state">Sin archivos que coincidan.</div>';
    return;
  }
  el.innerHTML = docs
    .map(
      (d) => `
      <div class="patient-directory-item${d.id === state.selectedId ? ' is-active' : ''}" data-doc-id="${d.id}">
        <span style="font-size:20px;">${TIPO_ICONS[d.tipo] || '📄'}</span>
        <div style="min-width:0;">
          <div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(d.nombre)}</div>
          <div class="text-tertiary" style="font-size:11.5px;">${formatDate(d.fecha, { withTime: true })}</div>
        </div>
      </div>
    `
    )
    .join('');

  el.querySelectorAll('[data-doc-id]').forEach((row) => {
    row.addEventListener('click', () => {
      state.selectedId = row.dataset.docId;
      render();
    });
  });
}

function renderViewer(doc) {
  const viewerEl = document.getElementById('doc-viewer');
  const infoEl = document.getElementById('doc-info');

  if (!doc) {
    viewerEl.innerHTML = cardHtml({ bodyHtml: '<div class="empty-state">Selecciona un archivo del listado.</div>' });
    infoEl.innerHTML = '';
    return;
  }

  const paciente = getById('pacientes', doc.pacienteId);

  viewerEl.innerHTML = cardHtml({
    title: doc.nombre,
    actionsHtml: `
      <button type="button" class="btn btn-secondary btn-sm" id="btn-imprimir-doc">🖨 Imprimir</button>
      <button type="button" class="btn btn-danger btn-sm" id="btn-eliminar-doc">🗑 Eliminar</button>
    `,
    bodyHtml: `
      <div style="display:flex; align-items:center; justify-content:center; background:var(--bg-surface-alt); border:1px dashed var(--border-color-strong); border-radius:var(--radius-md); height:280px; font-size:64px;">
        ${TIPO_ICONS[doc.tipo] || '📄'}
      </div>
      <div class="text-tertiary" style="font-size:11.5px; margin-top:8px; text-align:center;">
        Vista previa simulada (fase 1 sin backend) · ${escapeHtml(doc.tamano)}
      </div>
    `
  });

  infoEl.innerHTML = cardHtml({
    title: 'Información y etiquetas',
    bodyHtml: `
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Paciente</div><div class="info-value">${paciente ? `${escapeHtml(paciente.nombre)} ${escapeHtml(paciente.apellidos)}` : 'No asociado'}</div></div>
        <div class="info-item"><div class="info-label">Categoría</div><div class="info-value">${escapeHtml(doc.categoria)}</div></div>
        <div class="info-item"><div class="info-label">Fuente</div><div class="info-value">${escapeHtml(doc.fuente || '—')}</div></div>
        <div class="info-item"><div class="info-label">Modalidad</div><div class="info-value">${escapeHtml(doc.modalidad || '—')}</div></div>
        <div class="info-item"><div class="info-label">Técnico</div><div class="info-value">${escapeHtml(doc.tecnico || '—')}</div></div>
        <div class="info-item"><div class="info-label">Fecha</div><div class="info-value">${formatDate(doc.fecha, { withTime: true })}</div></div>
      </div>
      <hr class="divider" style="margin:14px 0;" />
      <div class="info-item">
        <div class="info-label">Descripción / Notas</div>
        <div class="info-value">${escapeHtml(doc.descripcion || 'Sin descripción.')}</div>
      </div>
      <div class="info-item" style="margin-top:10px;">
        <div class="info-label">Etiquetas</div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
          ${doc.tags.map((t) => `<span class="badge badge-primary">${escapeHtml(t)}</span>`).join('') || '<span class="text-tertiary">Sin etiquetas</span>'}
        </div>
      </div>
    `
  });

  document.getElementById('btn-imprimir-doc').addEventListener('click', () => window.print());
  document.getElementById('btn-eliminar-doc').addEventListener('click', async () => {
    if (!confirm(`¿Eliminar "${doc.nombre}" de la demo? Esta acción solo afecta los datos locales.`)) return;
    await remove('documentos', doc.id);
    state.selectedId = null;
    render();
  });
}

function openSubirModal() {
  const pacientes = getAll('pacientes');
  const bodyHtml = `
    <form id="form-subir-doc" class="form-grid">
      ${textField({ name: 'nombre', label: 'Nombre del archivo', required: true, span2: true })}
      ${selectField({ name: 'pacienteId', label: 'Paciente', required: true, span2: true, value: state.pacienteFiltro || '', options: pacientes.map((p) => ({ value: p.id, label: `${p.nombre} ${p.apellidos}` })) })}
      ${selectField({ name: 'tipo', label: 'Tipo', options: [{ value: 'imagen', label: 'Imagen' }, { value: 'documento', label: 'Documento' }, { value: 'nota', label: 'Nota' }] })}
      ${selectField({ name: 'categoria', label: 'Categoría', options: ['RX', 'Laboratorio', 'Nota', 'Informe', 'DICOM', 'Evolución', 'Electrocardiograma'] })}
      ${textareaField({ name: 'descripcion', label: 'Descripción', span2: true, rows: 2 })}
    </form>
    <p class="text-tertiary" style="font-size:12px; margin-top:8px;">Esta demo simula la carga: no se sube ningún archivo real a ningún servidor.</p>
  `;

  openModal({
    title: 'Subir archivo',
    bodyHtml,
    footerHtml: `
      <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="modal-save">Guardar</button>
    `,
    onMount: (modalEl, close) => {
      modalEl.querySelector('#modal-cancel').addEventListener('click', close);
      modalEl.querySelector('#modal-save').addEventListener('click', async () => {
        const form = modalEl.querySelector('#form-subir-doc');
        if (!validateRequired(form)) return;
        const data = getFormData(form);
        const nuevo = await create('documentos', {
          pacienteId: data.pacienteId,
          tipo: data.tipo,
          categoria: data.categoria,
          nombre: data.nombre,
          fecha: new Date().toISOString(),
          fuente: 'Carga manual (demo)',
          modalidad: '',
          tecnico: '',
          tags: [],
          descripcion: data.descripcion || '',
          tamano: '—'
        });
        close();
        state.selectedId = nuevo.id;
        render();
      });
    }
  });
}

export function unmount() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
}
