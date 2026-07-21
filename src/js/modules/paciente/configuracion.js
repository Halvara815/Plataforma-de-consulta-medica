import { update } from '../../services/dataService.js';
import { textField, selectField, getFormData, validateRequired } from '../../components/form.js';
import { showToast } from '../../components/toast.js';
import { icon } from '../../icons.js';

export function render(paciente, panelEl, ctx = {}) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Editar datos del paciente</h2></div>
      <form id="form-config-paciente" class="form-grid">
        ${textField({ name: 'nombre', label: 'Nombre(s)', value: paciente.nombre, required: true })}
        ${textField({ name: 'apellidos', label: 'Apellidos', value: paciente.apellidos, required: true })}
        ${textField({ name: 'email', label: 'Email', type: 'email', value: paciente.contacto.email })}
        ${textField({ name: 'telefono', label: 'Teléfono', value: paciente.contacto.telefono, required: true })}
        ${textField({ name: 'direccion', label: 'Domicilio', value: paciente.contacto.direccion, span2: true })}
        ${selectField({ name: 'estado', label: 'Estado del expediente', value: paciente.estado, options: [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }] })}
      </form>
      <div class="form-actions">
        <button type="button" class="btn btn-primary" id="btn-guardar-config">${icon('save', { size: 14 })} Guardar cambios</button>
      </div>
    </div>
  `;

  panelEl.querySelector('#btn-guardar-config').addEventListener('click', async () => {
    const form = panelEl.querySelector('#form-config-paciente');
    if (!validateRequired(form)) return;
    const data = getFormData(form);
    await update('pacientes', paciente.id, {
      nombre: data.nombre,
      apellidos: data.apellidos,
      estado: data.estado,
      contacto: { ...paciente.contacto, email: data.email, telefono: data.telefono, direccion: data.direccion }
    });
    showToast({ message: 'Datos del paciente actualizados.', tone: 'success' });
    if (typeof ctx.refresh === 'function') ctx.refresh();
  });
}
