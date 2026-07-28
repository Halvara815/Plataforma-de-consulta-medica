import { appState } from '../state.js';
import { cardHtml } from '../components/card.js';
import { setTopbarTitle } from '../components/topbar.js';
import { create, getAll, update, userFacingApiError } from '../services/dataService.js';
import { escapeHtml, formatDate, statusBadgeClass } from '../utils.js';

let cleanupFns = [];

export async function mount(container) {
  const { currentUser } = appState.getState();
  setTopbarTitle('Administración', 'Usuarios, roles y bitácora de seguridad');

  if (!currentUser?.permisos?.includes('usuarios:gestionar')) {
    container.innerHTML = `
      <section class="empty-state" role="alert">
        <h1>Acceso restringido</h1>
        <p>Tu cuenta no tiene permiso para administrar usuarios.</p>
      </section>
    `;
    return;
  }

  const load = async () => {
    const [users, roles, audit] = await Promise.all([
      getAll('usuarios'),
      getAll('usuarios/roles'),
      getAll('auditoria?limit=20'),
    ]);
    render(container, users, roles, audit.items || [], load);
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

function render(container, users, roles, auditEvents, reload) {
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
            title: 'Crear usuario',
            bodyHtml: createUserForm(roles),
          })}
          ${cardHtml({
            title: `Usuarios (${users.length})`,
            bodyHtml: users.length ? users.map((user) => userCard(user, roles)).join('') : '<p class="text-tertiary">No hay usuarios registrados.</p>',
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

function roleCheckboxes(roles, assigned = new Set()) {
  return roles.map((role, index) => `
    <label class="radio-option" style="margin-right:12px;">
      <input type="checkbox" name="roleNames" value="${escapeHtml(role.nombre)}" ${assigned.has(role.nombre) || (!assigned.size && index === 0) ? 'checked' : ''} />
      ${escapeHtml(role.nombre)}
    </label>
  `).join('');
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
