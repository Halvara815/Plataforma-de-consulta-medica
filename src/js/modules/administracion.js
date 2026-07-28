import { appState } from '../state.js';
import { cardHtml } from '../components/card.js';
import { setTopbarTitle } from '../components/topbar.js';
import { create, getAll, update, userFacingApiError } from '../services/dataService.js';
import { escapeHtml, formatDate, statusBadgeClass } from '../utils.js';

let cleanupFns = [];
const catalogTypes = [
  'diagnosticosCIE10', 'medicamentos', 'interaccionesConocidas', 'especialidades',
  'consultorios', 'aseguradoras', 'estadosCita', 'categoriasDocumento', 'estudiosCatalogo'
];

export async function mount(container) {
  const { currentUser } = appState.getState();
  setTopbarTitle('Administración', 'Cuentas, médicos y bitácora de seguridad');

  if (!currentUser?.permisos?.includes('usuarios:gestionar')) {
    container.innerHTML = `
      <section class="empty-state" role="alert">
        <h1>Acceso restringido</h1>
        <p>Tu cuenta no tiene permiso para administrar usuarios.</p>
      </section>
    `;
    return;
  }

  const canManageCatalogs = currentUser.permisos.includes('catalogos:gestionar');
  const load = async () => {
    const [users, roles, audit, medicos, entries] = await Promise.all([
      getAll('usuarios'),
      getAll('usuarios/roles'),
      getAll('auditoria?limit=20'),
      getAll('medicos'),
      canManageCatalogs
        ? Promise.all(catalogTypes.map(async (type) => [type, await getAll(`catalogos/entradas/${type}`)]))
        : Promise.resolve([]),
    ]);
    render(container, users, roles, audit.items || [], medicos, Object.fromEntries(entries), canManageCatalogs, load);
  };

  try {
    await load();
  } catch (error) {
    container.innerHTML = `
      <section class="empty-state" role="alert">
        <h1>No se pudo cargar la administración</h1>
        <p>${escapeHtml(userFacingApiError(error))}</p>
        <button type="button" class="btn btn-secondary" data-action="retry-admin">Reintentar</button>
      </section>
    `;
    container.querySelector('[data-action="retry-admin"]')?.addEventListener('click', () => void load());
  }
}

function render(container, users, roles, auditEvents, medicos, catalogEntries, canManageCatalogs, reload) {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  container.innerHTML = `
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Administración</h1>
          <p>Gestiona accesos de desarrollo y revisa la actividad reciente.</p>
        </div>
      </div>

      <div class="two-col">
        <div class="stack">
          ${cardHtml({
            title: 'Crear usuario de apoyo',
            bodyHtml: createUserForm(roles),
          })}
          ${cardHtml({
            title: `Usuarios (${users.length})`,
            bodyHtml: users.length ? users.map((user) => userCard(user, roles)).join('') : '<p class="text-tertiary">No hay usuarios registrados.</p>',
          })}
          ${cardHtml({
            title: `Perfiles médicos y solicitudes (${medicos.length})`,
            bodyHtml: medicos.length ? medicos.map(medicoCard).join('') : '<p class="text-tertiary">No hay médicos registrados.</p>',
          })}
        </div>
        <div class="stack">
          ${cardHtml({
            title: 'Roles disponibles',
            bodyHtml: roles.map((role) => `
              <div style="padding:10px 0; border-bottom:1px solid var(--border-color, #e5e7eb);">
                <strong>${escapeHtml(role.nombre)}</strong>
                <p class="text-tertiary" style="font-size:12px; margin:4px 0;">${escapeHtml(role.descripcion || 'Sin descripción')}</p>
                <p class="text-tertiary" style="font-size:11px; margin:0;">${escapeHtml(role.permisos.join(', '))}</p>
              </div>
            `).join(''),
          })}
          ${cardHtml({
            title: 'Actividad reciente',
            bodyHtml: auditEvents.length ? auditEvents.map(auditRow).join('') : '<p class="text-tertiary">No hay eventos disponibles.</p>',
          })}
          ${canManageCatalogs ? cardHtml({
            title: 'Catálogos clínicos',
            bodyHtml: catalogosCard(catalogEntries),
          }) : ''}
        </div>
      </div>
    </div>
  `;

  const createForm = container.querySelector('#create-user-form');
  const onCreate = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector('button[type="submit"]');
    const status = form.querySelector('[data-form-status]');
    submit.disabled = true;
    status.textContent = 'Creando usuario…';
    try {
      const data = new FormData(form);
      await create('usuarios', {
        email: data.get('email'),
        nombre: data.get('nombre'),
        password: data.get('password'),
        roleNames: data.getAll('roleNames'),
      });
      await reload();
    } catch (error) {
      status.textContent = userFacingApiError(error);
      submit.disabled = false;
    }
  };
  createForm?.addEventListener('submit', onCreate);
  cleanupFns.push(() => createForm?.removeEventListener('submit', onCreate));

  container.querySelectorAll('[data-user-form]').forEach((form) => {
    const onUpdate = async (event) => {
      event.preventDefault();
      const target = event.currentTarget;
      const submit = target.querySelector('button[type="submit"]');
      const status = target.querySelector('[data-form-status]');
      submit.disabled = true;
      status.textContent = 'Guardando…';
      try {
        const data = new FormData(target);
        const payload = {
          nombre: data.get('nombre'),
          email: data.get('email'),
          estado: data.get('estado'),
          roleNames: data.getAll('roleNames'),
        };
        const password = data.get('password');
        if (password) payload.password = password;
        await update('usuarios', target.dataset.userForm, payload);
        await reload();
      } catch (error) {
        status.textContent = userFacingApiError(error);
        submit.disabled = false;
      }
    };
    form.addEventListener('submit', onUpdate);
    cleanupFns.push(() => form.removeEventListener('submit', onUpdate));
  });

  container.querySelectorAll('[data-medico-form]').forEach((form) => {
    const onMedicoUpdate = async (event) => {
      event.preventDefault();
      const target = event.currentTarget;
      const submit = target.querySelector('button[type="submit"]');
      const status = target.querySelector('[data-form-status]');
      submit.disabled = true;
      status.textContent = 'Guardando perfil médico…';
      try {
        const data = new FormData(target);
        await update('medicos', target.dataset.medicoForm, {
          nombre: data.get('nombre'),
          especialidad: data.get('especialidad'),
          cedula: data.get('cedula'),
          consultorio: data.get('consultorio'),
          estado: data.get('estado'),
        });
        await reload();
      } catch (error) {
        status.textContent = userFacingApiError(error);
        submit.disabled = false;
      }
    };
    form.addEventListener('submit', onMedicoUpdate);
    cleanupFns.push(() => form.removeEventListener('submit', onMedicoUpdate));
  });

  const catalogForm = container.querySelector('#catalog-form');
  const onCatalogCreate = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector('[data-catalog-status]');
    const submit = form.querySelector('button[type="submit"]');
    const data = new FormData(form);
    let metadata;
    try {
      const rawMetadata = String(data.get('metadata') || '').trim();
      metadata = rawMetadata ? JSON.parse(rawMetadata) : undefined;
      if (metadata !== undefined && (Array.isArray(metadata) || typeof metadata !== 'object' || metadata === null)) {
        throw new Error('Los metadatos deben ser un objeto JSON.');
      }
    } catch (error) {
      status.textContent = error.message || 'Los metadatos no son JSON válido.';
      return;
    }
    submit.disabled = true;
    status.textContent = 'Guardando…';
    try {
      await create('catalogos/entradas', {
        tipo: data.get('tipo'),
        codigo: data.get('codigo'),
        nombre: data.get('nombre'),
        estado: data.get('estado'),
        ...(metadata === undefined ? {} : { metadata }),
      });
      await reload();
    } catch (error) {
      status.textContent = userFacingApiError(error);
      submit.disabled = false;
    }
  };
  catalogForm?.addEventListener('submit', onCatalogCreate);
  cleanupFns.push(() => catalogForm?.removeEventListener('submit', onCatalogCreate));

  container.querySelectorAll('[data-catalog-toggle]').forEach((button) => {
    const onToggle = async () => {
      button.disabled = true;
      try {
        await update('catalogos/entradas', button.dataset.catalogToggle, {
          estado: button.dataset.catalogState === 'activo' ? 'inactivo' : 'activo',
        });
        await reload();
      } catch (error) {
        button.disabled = false;
        alert(userFacingApiError(error));
      }
    };
    button.addEventListener('click', onToggle);
    cleanupFns.push(() => button.removeEventListener('click', onToggle));
  });
}

function catalogosCard(entriesByType) {
  const typeOptions = catalogTypes
    .map((type) => `<option value="${type}">${escapeHtml(catalogLabel(type))}</option>`)
    .join('');
  const lists = catalogTypes
    .map((type) => {
      const entries = entriesByType[type] || [];
      return `
        <details style="border-top:1px solid var(--border-color, #e5e7eb); padding:8px 0;">
          <summary style="cursor:pointer; font-size:13px;">${escapeHtml(catalogLabel(type))} (${entries.length})</summary>
          <div class="stack" style="gap:6px; margin-top:8px;">
            ${entries.length ? entries.map((entry) => `
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:12px;">
                <span><strong>${escapeHtml(entry.codigo)}</strong> · ${escapeHtml(entry.nombre)}</span>
                <button type="button" class="btn btn-ghost btn-sm" data-catalog-toggle="${escapeHtml(entry.id)}" data-catalog-state="${escapeHtml(entry.estado)}">${entry.estado === 'activo' ? 'Desactivar' : 'Activar'}</button>
              </div>
            `).join('') : '<span class="text-tertiary" style="font-size:12px;">Sin entradas.</span>'}
          </div>
        </details>`;
    })
    .join('');
  return `
    <form id="catalog-form" class="stack" style="gap:8px; padding-bottom:12px;">
      <p class="text-tertiary" style="font-size:12px; margin:0;">Las entradas inactivas no aparecen en los formularios clínicos, pero se conservan para trazabilidad.</p>
      <label>Tipo<select class="form-input" name="tipo">${typeOptions}</select></label>
      <label>Código<input class="form-input" name="codigo" required maxlength="120" placeholder="Ej. A10-001" /></label>
      <label>Nombre<input class="form-input" name="nombre" required maxlength="500" /></label>
      <label>Metadatos JSON <span class="text-tertiary" style="font-size:11px;">(opcional)</span><input class="form-input" name="metadata" placeholder='{"presentaciones":["500 mg"]}' /></label>
      <label>Estado<select class="form-input" name="estado"><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></label>
      <button class="btn btn-secondary" type="submit">Agregar entrada</button>
      <p class="text-tertiary" data-catalog-status style="font-size:12px; margin:0;"></p>
    </form>
    <div>${lists}</div>
  `;
}

function catalogLabel(type) {
  return {
    diagnosticosCIE10: 'Diagnósticos CIE-10', medicamentos: 'Medicamentos', interaccionesConocidas: 'Interacciones',
    especialidades: 'Especialidades', consultorios: 'Consultorios', aseguradoras: 'Aseguradoras',
    estadosCita: 'Estados de cita', categoriasDocumento: 'Categorías de documento', estudiosCatalogo: 'Estudios',
  }[type] || type;
}

function createUserForm(roles) {
  return `
    <form id="create-user-form" class="stack" style="padding:16px; gap:10px;">
      <label>Nombre<input class="form-input" name="nombre" required maxlength="120" autocomplete="name" /></label>
      <label>Correo<input class="form-input" name="email" type="email" required autocomplete="email" /></label>
      <label>Contraseña inicial<input class="form-input" name="password" type="password" required minlength="12" autocomplete="new-password" /></label>
      <fieldset style="border:0; padding:0; margin:0;"><legend style="font-size:13px; margin-bottom:6px;">Roles</legend>${roleCheckboxes(roles)}</fieldset>
      <button class="btn btn-primary" type="submit">Crear usuario</button>
      <p class="text-tertiary" data-form-status style="font-size:12px; margin:0;"></p>
    </form>
  `;
}

function userCard(user, roles) {
  const assigned = new Set(user.roles.map((role) => role.nombre));
  return `
    <form class="stack" data-user-form="${escapeHtml(user.id)}" style="padding:16px; border-bottom:1px solid var(--border-color, #e5e7eb); gap:9px;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
        <strong>${escapeHtml(user.nombre)}</strong>
        <span class="badge ${statusBadgeClass(user.estado)}">${escapeHtml(user.estado)}</span>
      </div>
      <label>Nombre<input class="form-input" name="nombre" required maxlength="120" value="${escapeHtml(user.nombre)}" /></label>
      <label>Correo<input class="form-input" name="email" type="email" required value="${escapeHtml(user.email)}" /></label>
      <label>Estado<select class="form-input" name="estado"><option value="activo" ${user.estado === 'activo' ? 'selected' : ''}>Activo</option><option value="inactivo" ${user.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option></select></label>
      <label>Nueva contraseña <span class="text-tertiary" style="font-size:11px;">(opcional, mínimo 12 caracteres)</span><input class="form-input" name="password" type="password" minlength="12" autocomplete="new-password" /></label>
      <fieldset style="border:0; padding:0; margin:0;"><legend style="font-size:13px; margin-bottom:6px;">Roles</legend>${roleCheckboxes(roles, assigned)}</fieldset>
      ${user.medico ? `<p class="text-tertiary" style="font-size:12px; margin:0;">Médico vinculado: ${escapeHtml(user.medico.nombre)} · ${escapeHtml(user.medico.especialidad)}</p>` : ''}
      <button class="btn btn-secondary" type="submit">Guardar cambios</button>
      <p class="text-tertiary" data-form-status style="font-size:12px; margin:0;"></p>
    </form>
  `;
}

function medicoCard(medico) {
  return `
    <form class="stack" data-medico-form="${escapeHtml(medico.id)}" style="padding:16px; border-bottom:1px solid var(--border-color, #e5e7eb); gap:9px;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
        <strong>${escapeHtml(medico.nombre)}</strong>
        <span class="badge ${statusBadgeClass(medico.estado)}">${escapeHtml(medico.estado)}</span>
      </div>
      <label>Nombre<input class="form-input" name="nombre" required maxlength="120" value="${escapeHtml(medico.nombre)}" /></label>
      <label>Especialidad<input class="form-input" name="especialidad" required maxlength="120" value="${escapeHtml(medico.especialidad)}" /></label>
      <label>Cédula profesional<input class="form-input" name="cedula" required maxlength="80" value="${escapeHtml(medico.cedula)}" /></label>
      <label>Consultorio<input class="form-input" name="consultorio" maxlength="120" value="${escapeHtml(medico.consultorio || '')}" /></label>
      <label>Estado<select class="form-input" name="estado">
        <option value="pendiente" ${medico.estado === 'pendiente' ? 'selected' : ''}>Pendiente de aprobación</option>
        <option value="activo" ${medico.estado === 'activo' ? 'selected' : ''}>Activo</option>
        <option value="inactivo" ${medico.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
      </select></label>
      <p class="text-tertiary" style="font-size:12px; margin:0;">Al activar o desactivar, el acceso de la cuenta médica se actualiza al mismo tiempo.</p>
      <button class="btn btn-secondary" type="submit">Guardar perfil médico</button>
      <p class="text-tertiary" data-form-status style="font-size:12px; margin:0;"></p>
    </form>
  `;
}

function roleCheckboxes(roles, assigned = new Set()) {
  const defaultRole = roles.find((role) => role.nombre !== 'ADMIN')?.nombre;
  return roles.map((role) => {
    if (role.nombre === 'ADMIN') {
      if (!assigned.has('ADMIN')) {
        return '<span class="text-tertiary" style="font-size:12px; margin-right:12px;">ADMIN se administra durante el aprovisionamiento inicial.</span>';
      }
      return `
        <label class="radio-option" style="margin-right:12px;">
          <input type="hidden" name="roleNames" value="ADMIN" />
          <input type="checkbox" checked disabled />
          ADMIN <span class="text-tertiary" style="font-size:11px;">(único administrador)</span>
        </label>
      `;
    }
    return `
      <label class="radio-option" style="margin-right:12px;">
        <input type="checkbox" name="roleNames" value="${escapeHtml(role.nombre)}" ${assigned.has(role.nombre) || (!assigned.size && role.nombre === defaultRole) ? 'checked' : ''} />
        ${escapeHtml(role.nombre)}
      </label>
    `;
  }).join('');
}

function auditRow(event) {
  const actor = event.usuario?.nombre || 'Sistema';
  return `
    <div style="padding:10px 0; border-bottom:1px solid var(--border-color, #e5e7eb);">
      <div style="display:flex; justify-content:space-between; gap:8px;"><strong style="font-size:13px;">${escapeHtml(event.accion)}</strong><span class="badge ${event.resultado === 'exitoso' ? 'badge-success' : 'badge-danger'}">${escapeHtml(event.resultado)}</span></div>
      <p class="text-tertiary" style="font-size:12px; margin:4px 0 0;">${escapeHtml(actor)} · ${escapeHtml(event.recursoTipo)} · ${escapeHtml(formatDate(event.createdAt, { withTime: true }))}</p>
    </div>
  `;
}

export function unmount() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
}
