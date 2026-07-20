import { getById, query as queryCollection } from '../services/dataService.js';
import { setTopbarTitle } from '../components/topbar.js';
import { cardHtml } from '../components/card.js';
import { createTabs } from '../components/tabs.js';
import { calcAge, escapeHtml, formatDate, initials } from '../utils.js';

let cleanupFns = [];

export async function mount(container, params = {}) {
  const paciente = getById('pacientes', params.id);

  if (!paciente) {
    container.innerHTML = '<div class="empty-state">Paciente no encontrado.</div>';
    return;
  }

  setTopbarTitle('Historia Clínica', 'Registro clínico completo y longitudinal del paciente');

  const consultas = queryCollection('consultas', (c) => c.pacienteId === paciente.id).sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );
  const estudios = queryCollection('estudios', (e) => e.pacienteId === paciente.id).sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );
  const ultima = consultas[0] || null;

  container.innerHTML = `
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Historia Clínica</h1>
          <p>Registro clínico completo y longitudinal del paciente</p>
        </div>
        <div class="view-actions">
          <a class="btn btn-primary" href="#/consulta/${paciente.id}">🩺 Nueva consulta</a>
        </div>
      </div>

      <div class="card">
        <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
          <span class="avatar-initials" style="width:56px;height:56px;font-size:18px;">${initials(paciente.nombre + ' ' + paciente.apellidos)}</span>
          <div style="flex:1; min-width:220px;">
            <h2 style="font-size:17px;">${escapeHtml(paciente.nombre)} ${escapeHtml(paciente.apellidos)}</h2>
            <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
              <span class="badge badge-primary">${calcAge(paciente.fechaNacimiento)} años</span>
              <span class="badge">${escapeHtml(paciente.sexo)}</span>
              <span class="badge badge-accent">Grupo ${escapeHtml(paciente.grupoSanguineo)}</span>
              ${paciente.alergias.length ? `<span class="badge badge-danger">Alergia a ${escapeHtml(paciente.alergias[0].sustancia)}</span>` : ''}
              ${paciente.alertas.map((a) => `<span class="badge badge-warning">${escapeHtml(a.tipo)}</span>`).join('')}
            </div>
          </div>
          <a class="btn btn-secondary btn-sm" href="#/pacientes/${paciente.id}">Ver ficha del paciente</a>
        </div>
      </div>

      <div class="two-col">
        <div id="historia-tabs-container"></div>
        <div class="stack">
          ${cardHtml({
            title: 'Línea de tiempo de consultas',
            bodyHtml: consultas.length
              ? `<div class="timeline">
                  ${consultas
                    .map(
                      (c) => `
                    <div class="timeline-item">
                      <div class="text-tertiary" style="font-size:11px;">${formatDate(c.fecha, { withTime: true })}</div>
                      <div style="font-size:13px; font-weight:600;">${escapeHtml(c.motivoConsulta)}</div>
                      <div class="text-tertiary" style="font-size:11.5px;">${escapeHtml(medicoNombre(c.medicoId))}</div>
                    </div>`
                    )
                    .join('')}
                </div>`
              : '<div class="empty-state">Sin consultas registradas.</div>'
          })}
          ${
            ultima
              ? cardHtml({
                  title: `Signos vitales (${formatDate(ultima.fecha, { withTime: true })})`,
                  bodyHtml: `
                    <div class="info-grid">
                      <div class="info-item"><div class="info-label">TA</div><div class="info-value">${escapeHtml(ultima.signosVitales.ta)} mmHg</div></div>
                      <div class="info-item"><div class="info-label">FC</div><div class="info-value">${ultima.signosVitales.fc} lpm</div></div>
                      <div class="info-item"><div class="info-label">FR</div><div class="info-value">${ultima.signosVitales.fr} rpm</div></div>
                      <div class="info-item"><div class="info-label">Temp.</div><div class="info-value">${ultima.signosVitales.temp} °C</div></div>
                      <div class="info-item"><div class="info-label">SpO₂</div><div class="info-value">${ultima.signosVitales.spo2} %</div></div>
                      <div class="info-item"><div class="info-label">Peso</div><div class="info-value">${ultima.signosVitales.peso} kg</div></div>
                      <div class="info-item"><div class="info-label">Talla</div><div class="info-value">${ultima.signosVitales.talla} cm</div></div>
                      <div class="info-item"><div class="info-label">IMC</div><div class="info-value">${ultima.signosVitales.imc} kg/m²</div></div>
                    </div>
                  `
                })
              : ''
          }
        </div>
      </div>
    </div>
  `;

  const tabsContainer = document.getElementById('historia-tabs-container');
  const tabs = createTabs({
    tabs: [
      { id: 'resumen', label: 'Resumen' },
      { id: 'antecedentes', label: 'Antecedentes' },
      { id: 'evolucion', label: 'Evolución' },
      { id: 'exploracion', label: 'Exploración Física' },
      { id: 'diagnosticos', label: 'Diagnósticos' },
      { id: 'tratamiento', label: 'Tratamiento' },
      { id: 'alergias', label: 'Alergias' },
      { id: 'vacunas', label: 'Vacunas' },
      { id: 'estudios', label: 'Estudios' }
    ],
    activeId: 'resumen',
    panelHtml: (tabId) => buildTabPanel(tabId, paciente, consultas, ultima, estudios)
  });
  tabsContainer.appendChild(wrapCard(tabs.el));
}

function wrapCard(el) {
  const card = document.createElement('div');
  card.className = 'card';
  card.appendChild(el);
  return card;
}

function medicoNombre(medicoId) {
  const medico = getById('medicos', medicoId);
  return medico ? medico.nombre : '';
}

function buildTabPanel(tabId, paciente, consultas, ultima, estudios) {
  if (!ultima && tabId !== 'alergias' && tabId !== 'estudios' && tabId !== 'vacunas') {
    return '<div class="empty-state">Aún no hay consultas registradas para este paciente.</div>';
  }

  switch (tabId) {
    case 'resumen':
      return `
        <div class="card-grid">
          <div class="card"><h3 style="font-size:13px; margin-bottom:8px;">Antecedentes heredofamiliares</h3><p style="font-size:13px;">${escapeHtml(ultima.antecedentes.heredofamiliares || 'Sin información')}</p></div>
          <div class="card"><h3 style="font-size:13px; margin-bottom:8px;">Antecedentes personales patológicos</h3><p style="font-size:13px;">${escapeHtml(ultima.antecedentes.personalesPatologicos || 'Sin información')}</p></div>
          <div class="card"><h3 style="font-size:13px; margin-bottom:8px;">Padecimiento actual</h3><p style="font-size:13px;">${escapeHtml(ultima.padecimientoActual)}</p></div>
          <div class="card">
            <h3 style="font-size:13px; margin-bottom:8px;">Síntomas</h3>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">${ultima.sintomas.map((s) => `<span class="badge badge-info">${escapeHtml(s)}</span>`).join('') || '<span class="text-tertiary">Sin síntomas registrados</span>'}</div>
          </div>
          <div class="card"><h3 style="font-size:13px; margin-bottom:8px;">Exploración física</h3><p style="font-size:13px;">${escapeHtml(ultima.exploracionFisica)}</p></div>
          <div class="card">
            <h3 style="font-size:13px; margin-bottom:8px;">Diagnóstico (CIE-10)</h3>
            <div class="stack" style="gap:6px;">${ultima.diagnosticos.map((d) => `<div><span class="badge badge-primary">${escapeHtml(d.cie10)}</span> ${escapeHtml(d.descripcion)}</div>`).join('') || '<span class="text-tertiary">Sin diagnóstico registrado</span>'}</div>
          </div>
          <div class="card">
            <h3 style="font-size:13px; margin-bottom:8px;">Plan terapéutico</h3>
            <ul style="padding-left:18px; font-size:13px; display:flex; flex-direction:column; gap:4px;">${ultima.planTerapeutico.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ul>
          </div>
          <div class="card"><h3 style="font-size:13px; margin-bottom:8px;">Notas</h3><p style="font-size:13px;">${escapeHtml(ultima.notas || 'Sin notas adicionales.')}</p></div>
        </div>
      `;
    case 'antecedentes':
      return `
        <div class="stack">
          <div class="info-item"><div class="info-label">Heredofamiliares</div><div class="info-value">${escapeHtml(ultima.antecedentes.heredofamiliares || 'Sin información')}</div></div>
          <div class="info-item"><div class="info-label">Personales patológicos</div><div class="info-value">${escapeHtml(ultima.antecedentes.personalesPatologicos || 'Sin información')}</div></div>
          <div class="info-item"><div class="info-label">Personales no patológicos</div><div class="info-value">${escapeHtml(ultima.antecedentes.personalesNoPatologicos || 'Sin información')}</div></div>
        </div>
      `;
    case 'evolucion':
      return consultas.length
        ? `<div class="timeline">
            ${consultas
              .map(
                (c) => `
              <div class="timeline-item">
                <div class="text-tertiary" style="font-size:11px;">${formatDate(c.fecha, { withTime: true })} · ${escapeHtml(medicoNombre(c.medicoId))}</div>
                <div style="font-size:13px; font-weight:600;">${escapeHtml(c.motivoConsulta)}</div>
                <p style="font-size:13px; margin-top:4px;">${escapeHtml(c.padecimientoActual)}</p>
              </div>`
              )
              .join('')}
          </div>`
        : '<div class="empty-state">Sin evolución registrada.</div>';
    case 'exploracion':
      return `<p style="font-size:13px;">${escapeHtml(ultima.exploracionFisica)}</p>`;
    case 'diagnosticos':
      return `
        <div class="stack">
          ${consultas
            .flatMap((c) => c.diagnosticos.map((d) => ({ ...d, fecha: c.fecha })))
            .map(
              (d) => `
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-color);">
              <div><span class="badge badge-primary">${escapeHtml(d.cie10)}</span> ${escapeHtml(d.descripcion)}</div>
              <span class="text-tertiary" style="font-size:12px;">${formatDate(d.fecha)}</span>
            </div>`
            )
            .join('') || '<div class="empty-state">Sin diagnósticos registrados.</div>'}
        </div>
      `;
    case 'tratamiento':
      return `<ul style="padding-left:18px; font-size:13px; display:flex; flex-direction:column; gap:6px;">${ultima.planTerapeutico.map((p) => `<li>${escapeHtml(p)}</li>`).join('') || '<li class="text-tertiary">Sin plan terapéutico registrado</li>'}</ul>`;
    case 'alergias':
      return paciente.alergias.length
        ? `<div class="stack">
            ${paciente.alergias
              .map(
                (a) => `
              <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-color);">
                <div style="font-size:13px; font-weight:600;">${escapeHtml(a.sustancia)}</div>
                <div class="text-tertiary" style="font-size:12px;">Reacción: ${escapeHtml(a.reaccion)}</div>
              </div>`
              )
              .join('')}
          </div>`
        : '<div class="empty-state">Sin alergias registradas.</div>';
    case 'vacunas':
      return '<div class="empty-state">Sin registros de vacunación cargados en esta demo.</div>';
    case 'estudios':
      return estudios.length
        ? `<div class="stack">
            ${estudios
              .map(
                (e) => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border-color);">
                <div>
                  <div style="font-size:13px; font-weight:600;">${escapeHtml(e.estudiosSolicitados.join(', '))}</div>
                  <div class="text-tertiary" style="font-size:11.5px;">${formatDate(e.fecha)} · ${e.tipoEstudio === 'laboratorio' ? 'Laboratorio' : 'Imagen'}</div>
                </div>
                <span class="badge ${e.estado === 'completado' ? 'badge-success' : e.estado === 'en_proceso' ? 'badge-info' : 'badge-warning'}">${e.estado.replace('_', ' ')}</span>
              </div>`
              )
              .join('')}
          </div>`
        : '<div class="empty-state">Sin órdenes de estudios registradas.</div>';
    default:
      return '';
  }
}

export function unmount() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
}
