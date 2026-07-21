import { getById, getCatalogos, create } from '../services/dataService.js';
import { setTopbarTitle } from '../components/topbar.js';
import { textField, textareaField, getFormData, validateRequired } from '../components/form.js';
import { navigateTo } from '../router.js';
import { calcAge, calcIMC, escapeHtml, initials } from '../utils.js';
import { icon } from '../icons.js';

let cleanupFns = [];
let timerInterval = null;

export async function mount(container, params = {}) {
  const paciente = getById('pacientes', params.id);
  if (!paciente) {
    container.innerHTML = '<div class="empty-state">Paciente no encontrado.</div>';
    return;
  }

  setTopbarTitle('Consulta médica', `${paciente.nombre} ${paciente.apellidos}`);

  const catalogos = getCatalogos();
  const medico = getById('medicos', 'MED-0001');
  const startTime = Date.now();

  container.innerHTML = `
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Consulta médica</h1>
          <p>Registro de la consulta activa</p>
        </div>
      </div>

      <div class="card">
        <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
          <span class="avatar-initials" style="width:56px;height:56px;font-size:18px;">${initials(paciente.nombre + ' ' + paciente.apellidos)}</span>
          <div style="flex:1; min-width:220px;">
            <h2 style="font-size:17px;">${escapeHtml(paciente.nombre)} ${escapeHtml(paciente.apellidos)}</h2>
            <div class="text-tertiary" style="font-size:12.5px;">${calcAge(paciente.fechaNacimiento)} años · ${escapeHtml(paciente.sexo)} · Grupo ${escapeHtml(paciente.grupoSanguineo)}</div>
          </div>
          <div style="text-align:right;">
            <div class="text-tertiary" style="font-size:11.5px;">Duración</div>
            <strong id="consulta-timer" style="font-size:16px;">00:00:00</strong>
          </div>
        </div>
      </div>

      <form id="form-consulta" class="stack">
        <div class="card">
          <div class="card-header"><h2>Motivo y padecimiento actual</h2></div>
          <div class="form-grid">
            ${textField({ name: 'motivoConsulta', label: 'Motivo de consulta', required: true, span2: true, placeholder: 'Ej. Consulta de seguimiento' })}
            ${textareaField({ name: 'padecimientoActual', label: 'Padecimiento actual', span2: true, rows: 3 })}
            ${textField({ name: 'sintomas', label: 'Síntomas (separados por coma)', span2: true, placeholder: 'Cefalea, mareo leve, cansancio' })}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h2>Signos vitales</h2></div>
          <div class="form-grid">
            ${textField({ name: 'ta', label: 'TA (mmHg)', placeholder: '120/80' })}
            ${textField({ name: 'fc', label: 'FC (lpm)', type: 'number' })}
            ${textField({ name: 'fr', label: 'FR (rpm)', type: 'number' })}
            ${textField({ name: 'temp', label: 'Temp. (°C)', type: 'number' })}
            ${textField({ name: 'spo2', label: 'SpO₂ (%)', type: 'number' })}
            ${textField({ name: 'peso', label: 'Peso (kg)', type: 'number' })}
            ${textField({ name: 'talla', label: 'Talla (cm)', type: 'number' })}
            <div class="form-field">
              <label>IMC calculado</label>
              <div class="input" id="consulta-imc-display" style="background:var(--bg-surface-alt);">—</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h2>Exploración física y antecedentes</h2></div>
          <div class="form-grid">
            ${textareaField({ name: 'exploracionFisica', label: 'Exploración física', span2: true, rows: 3 })}
            ${textareaField({ name: 'heredofamiliares', label: 'Antecedentes heredofamiliares', span2: true, rows: 2 })}
            ${textareaField({ name: 'personalesPatologicos', label: 'Antecedentes personales patológicos', span2: true, rows: 2 })}
            ${textareaField({ name: 'personalesNoPatologicos', label: 'Antecedentes personales no patológicos', span2: true, rows: 2 })}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h2>Diagnóstico (CIE-10)</h2></div>
          <div class="form-grid">
            <div class="form-field span-2">
              <label for="f-diagnosticos">Selecciona uno o más diagnósticos</label>
              <select class="input" id="f-diagnosticos" name="diagnosticos" multiple size="6">
                ${catalogos.diagnosticosCIE10
                  .map((d) => `<option value="${escapeHtml(d.codigo)}|${escapeHtml(d.descripcion)}">${escapeHtml(d.codigo)} · ${escapeHtml(d.descripcion)}</option>`)
                  .join('')}
              </select>
              <span class="hint">Mantén Ctrl (Cmd en Mac) para seleccionar varios.</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h2>Plan terapéutico y notas</h2></div>
          <div class="form-grid">
            ${textareaField({ name: 'planTerapeutico', label: 'Plan terapéutico (una indicación por línea)', span2: true, rows: 4, placeholder: 'Losartán 50 mg VO cada 24 horas.\nDieta hiposódica.' })}
            ${textareaField({ name: 'notas', label: 'Notas adicionales', span2: true, rows: 2 })}
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="btn-cancelar-consulta">Cancelar</button>
          <button type="submit" class="btn btn-primary" id="btn-guardar-consulta">${icon('check', { size: 15 })} Guardar consulta</button>
        </div>
      </form>
    </div>
  `;

  wireImcCalculation();
  wireTimer(startTime);

  document.getElementById('btn-cancelar-consulta').addEventListener('click', () => {
    navigateTo(`#/historia-clinica/${paciente.id}`);
  });

  document.getElementById('form-consulta').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!validateRequired(form)) return;
    const data = getFormData(form);

    const diagnosticosSelect = document.getElementById('f-diagnosticos');
    const diagnosticos = [...diagnosticosSelect.selectedOptions].map((opt) => {
      const [cie10, descripcion] = opt.value.split('|');
      return { cie10, descripcion, tipo: 'definitivo' };
    });

    const peso = parseFloat(data.peso) || null;
    const talla = parseFloat(data.talla) || null;

    await create('consultas', {
      pacienteId: paciente.id,
      medicoId: medico?.id || 'MED-0001',
      fecha: new Date().toISOString(),
      tipo: 'seguimiento',
      motivoConsulta: data.motivoConsulta,
      padecimientoActual: data.padecimientoActual || '',
      sintomas: data.sintomas ? data.sintomas.split(',').map((s) => s.trim()).filter(Boolean) : [],
      signosVitales: {
        ta: data.ta || '',
        fc: parseInt(data.fc, 10) || null,
        fr: parseInt(data.fr, 10) || null,
        temp: parseFloat(data.temp) || null,
        spo2: parseInt(data.spo2, 10) || null,
        peso,
        talla,
        imc: calcIMC(peso, talla)
      },
      exploracionFisica: data.exploracionFisica || '',
      antecedentes: {
        heredofamiliares: data.heredofamiliares || '',
        personalesPatologicos: data.personalesPatologicos || '',
        personalesNoPatologicos: data.personalesNoPatologicos || ''
      },
      diagnosticos,
      planTerapeutico: data.planTerapeutico ? data.planTerapeutico.split('\n').map((s) => s.trim()).filter(Boolean) : [],
      notas: data.notas || '',
      duracion: document.getElementById('consulta-timer')?.textContent || '00:00:00',
      estado: 'completada'
    });

    navigateTo(`#/historia-clinica/${paciente.id}`);
  });
}

function wireImcCalculation() {
  const pesoInput = document.querySelector('[name="peso"]');
  const tallaInput = document.querySelector('[name="talla"]');
  const display = document.getElementById('consulta-imc-display');

  function update() {
    const peso = parseFloat(pesoInput.value);
    const talla = parseFloat(tallaInput.value);
    const imc = calcIMC(peso, talla);
    display.textContent = imc ? `${imc} kg/m²` : '—';
  }

  pesoInput.addEventListener('input', update);
  tallaInput.addEventListener('input', update);
  cleanupFns.push(() => {
    pesoInput.removeEventListener('input', update);
    tallaInput.removeEventListener('input', update);
  });
}

function wireTimer(startTime) {
  const el = document.getElementById('consulta-timer');
  function tick() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    if (el) el.textContent = `${h}:${m}:${s}`;
  }
  tick();
  timerInterval = setInterval(tick, 1000);
}

export function unmount() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
