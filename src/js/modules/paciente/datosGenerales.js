import { escapeHtml, formatDate } from '../../utils.js';

export function render(paciente, panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Datos demográficos</h2></div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Fecha de nacimiento</div><div class="info-value">${formatDate(paciente.fechaNacimiento)}</div></div>
        <div class="info-item"><div class="info-label">Estado civil</div><div class="info-value">${escapeHtml(paciente.estadoCivil)}</div></div>
        <div class="info-item"><div class="info-label">CURP</div><div class="info-value">${escapeHtml(paciente.curp)}</div></div>
        <div class="info-item"><div class="info-label">NSS</div><div class="info-value">${escapeHtml(paciente.nss)}</div></div>
        <div class="info-item"><div class="info-label">Sexo</div><div class="info-value">${escapeHtml(paciente.sexo)}</div></div>
        <div class="info-item"><div class="info-label">Grupo sanguíneo</div><div class="info-value">${escapeHtml(paciente.grupoSanguineo)}</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Contacto</h2></div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Email</div><div class="info-value">${escapeHtml(paciente.contacto.email)}</div></div>
        <div class="info-item"><div class="info-label">Teléfono</div><div class="info-value">${escapeHtml(paciente.contacto.telefono)}</div></div>
        <div class="info-item"><div class="info-label">Domicilio</div><div class="info-value">${escapeHtml(paciente.contacto.direccion)}</div></div>
        <div class="info-item"><div class="info-label">Contacto de emergencia</div><div class="info-value">${escapeHtml(paciente.contactoEmergencia.nombre)} (${escapeHtml(paciente.contactoEmergencia.parentesco)})</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Seguro médico</h2></div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Aseguradora</div><div class="info-value">${escapeHtml(paciente.aseguradora.compania)}</div></div>
        <div class="info-item"><div class="info-label">Póliza</div><div class="info-value">${escapeHtml(paciente.aseguradora.poliza)}</div></div>
        <div class="info-item"><div class="info-label">Plan</div><div class="info-value">${escapeHtml(paciente.aseguradora.plan)}</div></div>
        <div class="info-item"><div class="info-label">Vigencia</div><div class="info-value">${formatDate(paciente.aseguradora.vigenciaInicio)} – ${formatDate(paciente.aseguradora.vigenciaFin)}</div></div>
      </div>
    </div>
  `;
}
