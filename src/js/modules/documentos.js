import { getAll, getById, create, update, remove } from '../services/dataService.js';
import { appState } from '../state.js';
import { setTopbarTitle } from '../components/topbar.js';
import { cardHtml } from '../components/card.js';
import { openModal } from '../components/modal.js';
import { textField, selectField, textareaField, getFormData, validateRequired } from '../components/form.js';
import { showToast } from '../components/toast.js';
import { escapeHtml, formatDate, formatBytes, downloadBlob } from '../utils.js';
import { icon } from '../icons.js';

const CATEGORIAS = [
  'Radiografía',
  'Resonancia',
  'Tomografía',
  'Ecografía',
  'Fotografía clínica',
  'Laboratorio',
  'Receta',
  'Consentimiento',
  'Informe médico',
  'Electrocardiograma',
  'DICOM',
  'Evolución',
  'Nota',
  'Otro'
];

const EXT_CATEGORY = {
  pdf: 'Informe médico',
  doc: 'Informe médico',
  docx: 'Informe médico',
  xls: 'Laboratorio',
  xlsx: 'Laboratorio',
  csv: 'Laboratorio',
  txt: 'Nota',
  dcm: 'DICOM'
};

const EXT_ICON = {
  pdf: 'file-text',
  doc: 'file-text',
  docx: 'file-text',
  xls: 'file-spreadsheet',
  xlsx: 'file-spreadsheet',
  csv: 'file-spreadsheet',
  txt: 'file-text',
  dcm: 'file'
};

let state = {
  tipo: 'todos',
  categoria: '',
  search: '',
  selectedId: null,
  pacienteFiltro: null,
  view: 'list'
};

let objectUrls = new Map(); // docId -> { blob, url }
let uploadQueue = [];
let uploadSeq = 0;
let cleanupFns = [];

function ext(filename = '') {
  const m = /\.([a-z0-9]+)$/i.exec(filename);
  return m ? m[1].toLowerCase() : '';
}

function guessCategoria(file) {
  return EXT_CATEGORY[ext(file.name)] || (file.type.startsWith('image/') ? 'Fotografía clínica' : 'Otro');
}

function tipoIconFor(doc) {
  if (doc.tipo === 'imagen') return 'image';
  if (doc.tipo === 'nota') return 'note';
  return EXT_ICON[ext(doc.nombre)] || 'file-text';
}

function objectUrlFor(doc) {
  if (!doc.blob) return null;
  const cached = objectUrls.get(doc.id);
  if (cached && cached.blob === doc.blob) return cached.url;
  if (cached) URL.revokeObjectURL(cached.url);
  const url = URL.createObjectURL(doc.blob);
  objectUrls.set(doc.id, { blob: doc.blob, url });
  return url;
}

function revokeAllObjectUrls() {
  objectUrls.forEach(({ url }) => URL.revokeObjectURL(url));
  objectUrls.clear();
}

export async function mount(container, params = {}, query = {}) {
  setTopbarTitle('Imágenes / Documentos', 'Gestor completo de archivos e imágenes clínicas');
  const { currentUser } = appState.getState();

  state = {
    tipo: query.tipo && ['imagen', 'documento', 'nota'].includes(query.tipo) ? query.tipo : 'todos',
    categoria: '',
    search: '',
    selectedId: query.doc || null,
    pacienteFiltro: query.pacienteId || null,
    view: 'list'
  };
  uploadQueue = [];

  container.innerHTML = `
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Imágenes / Documentos Médicos</h1>
          <p>Cargue, organice y administre estudios, imágenes y documentos clínicos.</p>
        </div>
        <div class="view-actions">
          <button type="button" class="btn btn-primary" id="btn-subir-archivo">${icon('upload', { size: 15 })} Subir archivo</button>
        </div>
      </div>

      <div class="card">
        <div id="dropzone" class="dropzone" tabindex="0" role="button" aria-label="Zona de carga de archivos">
          ${icon('upload-cloud')}
          <strong>Arrastra archivos aquí o haz clic para seleccionar</strong>
          <span class="text-tertiary" style="font-size:12px;">Imágenes (radiografías, resonancias, tomografías, ecografías, fotos clínicas) y documentos (PDF, Word, Excel, TXT)</span>
          <input type="file" id="file-input" multiple style="display:none;" />
        </div>
        <div id="upload-queue" class="upload-queue" style="margin-top:12px;"></div>
      </div>

      <div class="two-col">
        <div class="card">
          <div class="stack" style="gap:10px;">
            <div class="file-toolbar">
              <div class="table-search" style="flex:1;">
                ${icon('search', { size: 16 })}
                <input type="search" id="doc-search" placeholder="Buscar archivos por nombre, categoría o etiqueta…" />
              </div>
              <div class="view-toggle">
                <button type="button" data-view="list" class="is-active" aria-label="Vista de lista">${icon('list', { size: 16 })}</button>
                <button type="button" data-view="grid" aria-label="Vista de cuadrícula">${icon('grid', { size: 16 })}</button>
              </div>
            </div>
            <div class="tabs" role="tablist" id="doc-type-tabs">
              ${['todos', 'imagen', 'documento', 'nota']
                .map(
                  (t) =>
                    `<button type="button" class="tab-btn${t === state.tipo ? ' is-active' : ''}" data-tipo="${t}">${t === 'todos' ? 'Todos' : t === 'imagen' ? 'Imágenes' : t === 'documento' ? 'Documentos' : 'Notas'}</button>`
                )
                .join('')}
            </div>
            ${selectField({ name: 'categoria-filter', label: 'Filtrar por categoría', value: '', options: [{ value: '', label: 'Todas las categorías' }, ...CATEGORIAS.map((c) => ({ value: c, label: c }))] })}
            <div class="text-tertiary" id="doc-count" style="font-size:11.5px;"></div>
            <div id="doc-list"></div>
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

  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');

  document.getElementById('btn-subir-archivo').addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });
  ['dragenter', 'dragover'].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    })
  );
  ['dragleave', 'drop'].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
    })
  );
  dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files, currentUser);
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files?.length) handleFiles(e.target.files, currentUser);
    fileInput.value = '';
  });

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
  document.getElementById('f-categoria-filter').addEventListener('change', (e) => {
    state.categoria = e.target.value;
    render();
  });
  document.querySelectorAll('.view-toggle [data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.view;
      document.querySelectorAll('.view-toggle [data-view]').forEach((b) => b.classList.toggle('is-active', b === btn));
      renderList(getFilteredDocs());
    });
  });

  if (query.action === 'subir') fileInput.click();
}

function handleFiles(fileList, currentUser) {
  Array.from(fileList).forEach((file) => {
    const uploadId = `up-${++uploadSeq}`;
    const item = { uploadId, name: file.name, progress: 0 };
    uploadQueue.push(item);
    renderUploadQueue();

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        item.progress = Math.round((e.loaded / e.total) * 100);
        renderUploadQueue();
      }
    };
    reader.onerror = () => {
      uploadQueue = uploadQueue.filter((u) => u.uploadId !== uploadId);
      renderUploadQueue();
      showToast({ message: `No se pudo leer "${file.name}".`, tone: 'danger' });
    };
    reader.onload = async () => {
      item.progress = 100;
      renderUploadQueue();
      const nuevo = await create('documentos', {
        pacienteId: state.pacienteFiltro,
        tipo: file.type.startsWith('image/') ? 'imagen' : 'documento',
        categoria: guessCategoria(file),
        nombre: file.name,
        fecha: new Date().toISOString(),
        fuente: 'Carga manual',
        modalidad: '',
        tecnico: '',
        mimeType: file.type,
        sizeBytes: file.size,
        blob: file,
        uploadedBy: currentUser.nombre,
        tags: [],
        descripcion: '',
        tamano: formatBytes(file.size)
      });
      setTimeout(() => {
        uploadQueue = uploadQueue.filter((u) => u.uploadId !== uploadId);
        renderUploadQueue();
      }, 500);
      state.selectedId = nuevo.id;
      render();
      showToast({ message: `"${file.name}" se cargó correctamente.`, tone: 'success' });
    };
    reader.readAsArrayBuffer(file);
  });
}

function renderUploadQueue() {
  const el = document.getElementById('upload-queue');
  if (!el) return;
  el.innerHTML = uploadQueue
    .map(
      (u) => `
      <div class="upload-progress-row">
        <span style="min-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(u.name)}</span>
        <div class="upload-progress"><div class="upload-progress-bar" style="width:${u.progress}%;"></div></div>
        <span style="width:36px; text-align:right;">${u.progress}%</span>
      </div>`
    )
    .join('');
}

function getFilteredDocs() {
  let docs = getAll('documentos');
  if (state.pacienteFiltro) docs = docs.filter((d) => d.pacienteId === state.pacienteFiltro);
  if (state.tipo !== 'todos') docs = docs.filter((d) => d.tipo === state.tipo);
  if (state.categoria) docs = docs.filter((d) => d.categoria === state.categoria);
  if (state.search) {
    const term = state.search.toLowerCase();
    docs = docs.filter((d) => `${d.nombre} ${d.categoria} ${(d.tags || []).join(' ')}`.toLowerCase().includes(term));
  }
  return [...docs].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

function render() {
  const docs = getFilteredDocs();
  if (!state.selectedId || !docs.some((d) => d.id === state.selectedId)) {
    state.selectedId = docs[0]?.id || null;
  }
  const countEl = document.getElementById('doc-count');
  if (countEl) countEl.textContent = `${docs.length} archivo(s)`;
  renderList(docs);
  renderViewer(docs.find((d) => d.id === state.selectedId));
}

function renderList(docs) {
  const el = document.getElementById('doc-list');
  if (!docs.length) {
    el.innerHTML = '<div class="empty-state">Sin archivos que coincidan.</div>';
    return;
  }

  if (state.view === 'grid') {
    el.innerHTML = `<div class="file-grid">
      ${docs
        .map(
          (d) => `
        <div class="file-card${d.id === state.selectedId ? ' is-active' : ''}" data-doc-id="${d.id}">
          <div class="file-card-thumb">${d.tipo === 'imagen' && objectUrlFor(d) ? `<img src="${objectUrlFor(d)}" alt="" />` : icon(tipoIconFor(d), { size: 26 })}</div>
          <div class="file-card-name">${escapeHtml(d.nombre)}</div>
          <div class="file-card-meta"><span>${escapeHtml(d.categoria || '')}</span><span>${formatBytes(d.sizeBytes)}</span></div>
        </div>`
        )
        .join('')}
    </div>`;
  } else {
    el.innerHTML = `<div class="patient-directory">
      ${docs
        .map(
          (d) => `
        <div class="patient-directory-item${d.id === state.selectedId ? ' is-active' : ''}" data-doc-id="${d.id}">
          <span class="file-type-icon">${d.tipo === 'imagen' && objectUrlFor(d) ? `<img src="${objectUrlFor(d)}" alt="" />` : icon(tipoIconFor(d), { size: 18 })}</span>
          <div style="min-width:0;">
            <div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(d.nombre)}</div>
            <div class="text-tertiary" style="font-size:11.5px;">${escapeHtml(d.categoria || '')} · ${formatDate(d.fecha, { withTime: true })}</div>
          </div>
        </div>`
        )
        .join('')}
    </div>`;
  }

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
  const url = objectUrlFor(doc);

  let previewHtml;
  if (doc.tipo === 'imagen' && url) {
    previewHtml = `<div class="file-preview-placeholder" style="padding:0; height:320px;"><img src="${url}" alt="${escapeHtml(doc.nombre)}" style="max-width:100%; max-height:100%; object-fit:contain;" /></div>`;
  } else if (doc.mimeType === 'application/pdf' && url) {
    previewHtml = `<iframe class="file-preview-frame" src="${url}" title="${escapeHtml(doc.nombre)}"></iframe>`;
  } else if (url) {
    previewHtml = `<div class="file-preview-placeholder">${icon(tipoIconFor(doc), { size: 56 })}</div>
      <div class="text-tertiary" style="font-size:11.5px; margin-top:8px; text-align:center;">Vista previa no disponible para este tipo de archivo. Descárgalo para verlo.</div>`;
  } else {
    previewHtml = `<div class="file-preview-placeholder">${icon(tipoIconFor(doc), { size: 56 })}</div>
      <div class="text-tertiary" style="font-size:11.5px; margin-top:8px; text-align:center;">Vista previa simulada (dato de demostración sin archivo real)</div>`;
  }

  viewerEl.innerHTML = cardHtml({
    title: doc.nombre,
    actionsHtml: `
      <button type="button" class="btn btn-secondary btn-sm" id="btn-descargar-doc">${icon('download', { size: 14 })} Descargar</button>
      <button type="button" class="btn btn-secondary btn-sm" id="btn-editar-doc">${icon('edit', { size: 14 })} Editar</button>
      <button type="button" class="btn btn-secondary btn-sm" id="btn-reemplazar-doc">${icon('refresh', { size: 14 })} Reemplazar</button>
      <button type="button" class="btn btn-secondary btn-sm" id="btn-compartir-doc">${icon('share', { size: 14 })} Compartir</button>
      <button type="button" class="btn btn-secondary btn-sm" id="btn-imprimir-doc">${icon('printer', { size: 14 })} Imprimir</button>
      <button type="button" class="btn btn-danger btn-sm" id="btn-eliminar-doc">${icon('trash', { size: 14 })} Eliminar</button>
    `,
    bodyHtml: `
      ${previewHtml}
      <input type="file" id="replace-input" style="display:none;" />
    `
  });

  infoEl.innerHTML = cardHtml({
    title: 'Información y etiquetas',
    bodyHtml: `
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Paciente</div><div class="info-value">${paciente ? `${escapeHtml(paciente.nombre)} ${escapeHtml(paciente.apellidos)}` : 'No asociado'}</div></div>
        <div class="info-item"><div class="info-label">Categoría</div><div class="info-value">${escapeHtml(doc.categoria)}</div></div>
        <div class="info-item"><div class="info-label">Tamaño</div><div class="info-value">${formatBytes(doc.sizeBytes) !== '—' ? formatBytes(doc.sizeBytes) : escapeHtml(doc.tamano || '—')}</div></div>
        <div class="info-item"><div class="info-label">Cargado por</div><div class="info-value">${escapeHtml(doc.uploadedBy || doc.fuente || '—')}</div></div>
        <div class="info-item"><div class="info-label">Fecha</div><div class="info-value">${formatDate(doc.fecha, { withTime: true })}</div></div>
        <div class="info-item"><div class="info-label">Tipo</div><div class="info-value">${escapeHtml(doc.mimeType || doc.modalidad || '—')}</div></div>
      </div>
      <hr class="divider" style="margin:14px 0;" />
      <div class="info-item">
        <div class="info-label">Descripción / Notas</div>
        <div class="info-value">${escapeHtml(doc.descripcion || 'Sin descripción.')}</div>
      </div>
      <div class="info-item" style="margin-top:10px;">
        <div class="info-label">Etiquetas</div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
          ${(doc.tags || []).map((t) => `<span class="badge badge-primary">${escapeHtml(t)}</span>`).join('') || '<span class="text-tertiary">Sin etiquetas</span>'}
        </div>
      </div>
    `
  });

  document.getElementById('btn-descargar-doc').addEventListener('click', () => {
    if (!doc.blob) {
      showToast({ message: 'Este archivo es un dato de demostración sin contenido real para descargar.', tone: 'warning' });
      return;
    }
    downloadBlob(doc.blob, doc.nombre);
  });

  document.getElementById('btn-editar-doc').addEventListener('click', () => openEditarModal(doc));

  const replaceInput = document.getElementById('replace-input');
  document.getElementById('btn-reemplazar-doc').addEventListener('click', () => replaceInput.click());
  replaceInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await update('documentos', doc.id, {
      blob: file,
      mimeType: file.type,
      sizeBytes: file.size,
      tamano: formatBytes(file.size),
      tipo: file.type.startsWith('image/') ? 'imagen' : 'documento',
      fecha: new Date().toISOString()
    });
    showToast({ message: 'Archivo reemplazado correctamente.', tone: 'success' });
    render();
  });

  document.getElementById('btn-compartir-doc').addEventListener('click', async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/documentos?doc=${doc.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast({ message: 'Enlace copiado al portapapeles.', tone: 'success' });
    } catch {
      showToast({ message: shareUrl, duration: 6000 });
    }
  });

  document.getElementById('btn-imprimir-doc').addEventListener('click', () => window.print());

  document.getElementById('btn-eliminar-doc').addEventListener('click', async () => {
    if (!confirm(`¿Eliminar "${doc.nombre}"? Esta acción solo afecta los datos locales de la demo.`)) return;
    const cached = objectUrls.get(doc.id);
    if (cached) {
      URL.revokeObjectURL(cached.url);
      objectUrls.delete(doc.id);
    }
    await remove('documentos', doc.id);
    state.selectedId = null;
    render();
  });
}

function openEditarModal(doc) {
  const bodyHtml = `
    <form id="form-editar-doc" class="form-grid">
      ${textField({ name: 'nombre', label: 'Nombre del archivo', value: doc.nombre, required: true, span2: true })}
      ${selectField({ name: 'categoria', label: 'Categoría', value: doc.categoria, options: CATEGORIAS })}
      ${textField({ name: 'tags', label: 'Etiquetas (separadas por coma)', value: (doc.tags || []).join(', '), span2: true })}
      ${textareaField({ name: 'descripcion', label: 'Descripción', value: doc.descripcion || '', span2: true, rows: 3 })}
    </form>
  `;

  openModal({
    title: 'Editar archivo',
    bodyHtml,
    footerHtml: `
      <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="modal-save">Guardar cambios</button>
    `,
    onMount: (modalEl, close) => {
      modalEl.querySelector('#modal-cancel').addEventListener('click', close);
      modalEl.querySelector('#modal-save').addEventListener('click', async () => {
        const form = modalEl.querySelector('#form-editar-doc');
        if (!validateRequired(form)) return;
        const data = getFormData(form);
        await update('documentos', doc.id, {
          nombre: data.nombre,
          categoria: data.categoria,
          descripcion: data.descripcion || '',
          tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
        });
        close();
        showToast({ message: 'Archivo actualizado.', tone: 'success' });
        render();
      });
    }
  });
}

export function unmount() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  revokeAllObjectUrls();
  uploadQueue = [];
}
