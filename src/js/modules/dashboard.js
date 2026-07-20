import { getAll } from '../services/dataService.js';
import { setTopbarTitle } from '../components/topbar.js';
import { metricCardHtml, cardHtml } from '../components/card.js';
import { navigateTo } from '../router.js';
import {
  calcAge,
  donutChartSvg,
  lineChartSvg,
  chartColor,
  escapeHtml,
  formatDate,
  initials,
  statusBadgeClass,
  statusLabel
} from '../utils.js';

// Fecha ancla de la demo: las citas ficticias están concentradas en este día
// para que el dashboard y la agenda muestren contenido representativo sin depender del reloj real.
const DEMO_TODAY = '2026-07-20';
const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

let cleanupFns = [];

export async function mount(container) {
  setTopbarTitle('Panel General', 'Resumen de la actividad clínica de hoy');

  const pacientes = getAll('pacientes');
  const citas = getAll('citas');
  const consultas = getAll('consultas');
  const recetas = getAll('recetas');
  const estudios = getAll('estudios');

  const citasHoy = citas.filter((c) => c.fecha === DEMO_TODAY).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  const proximaCita = citasHoy.find((c) => c.pacienteId);
  const pacientesActivos = pacientes.filter((p) => p.estado === 'activo');
  const alertas = pacientes.flatMap((p) => p.alertas.map((a) => ({ ...a, paciente: p })));
  const alertasActivas = alertas.filter((a) => a.activa);
  const estudiosPendientes = estudios.filter((e) => e.estado !== 'completado');

  const pacientesById = Object.fromEntries(pacientes.map((p) => [p.id, p]));

  container.innerHTML = `
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Panel General</h1>
          <p>Resumen de la actividad clínica de hoy</p>
        </div>
      </div>

      <div class="card-grid">
        ${metricCardHtml({ label: 'Citas de hoy', value: citasHoy.length, icon: '📅', trend: proximaCita ? `Próxima: ${proximaCita.horaInicio}` : 'Sin citas próximas', tone: 'primary' })}
        ${metricCardHtml({ label: 'Pacientes activos', value: pacientesActivos.length, icon: '🧑‍⚕️', trend: `${pacientes.length} en total`, tone: 'accent' })}
        ${metricCardHtml({ label: 'Seguimientos pendientes', value: alertasActivas.length, icon: '📋', trend: `${estudiosPendientes.length} estudio(s) en proceso`, tone: 'warning' })}
        ${metricCardHtml({ label: 'Recetas emitidas', value: recetas.length, icon: '💊', trend: 'Acumulado de la demo', tone: 'success' })}
        ${metricCardHtml({ label: 'Alertas clínicas', value: alertasActivas.length + estudiosPendientes.length, icon: '⚠️', trend: 'Requieren atención', tone: 'danger' })}
      </div>

      <div class="two-col">
        <div class="stack">
          ${cardHtml({
            title: 'Agenda de hoy',
            actionsHtml: `<a href="#/agenda" class="btn btn-ghost btn-sm">Ver agenda completa</a>`,
            bodyHtml: `<div id="dash-agenda-list" class="stack"></div>`
          })}
          ${cardHtml({
            title: 'Consultas esta semana',
            bodyHtml: `<div id="dash-line-chart"></div>`
          })}
        </div>
        <div class="stack">
          ${cardHtml({
            title: 'Pacientes recientes',
            actionsHtml: `<a href="#/pacientes" class="btn btn-ghost btn-sm">Ver todos</a>`,
            bodyHtml: `<div id="dash-pacientes-list" class="stack"></div>`
          })}
          ${cardHtml({
            title: 'Seguimientos pendientes',
            bodyHtml: `<div id="dash-seguimientos-list" class="stack"></div>`
          })}
          ${cardHtml({
            title: 'Diagnósticos más frecuentes',
            bodyHtml: `<div id="dash-donut" style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;"></div>`
          })}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h2>Acciones rápidas</h2></div>
        <div class="card-grid">
          <button type="button" class="btn btn-secondary" data-action="nuevo-paciente">➕ Nuevo paciente</button>
          <button type="button" class="btn btn-secondary" data-action="nueva-consulta">🩺 Nueva consulta</button>
          <button type="button" class="btn btn-secondary" data-action="receta">💊 Receta</button>
          <button type="button" class="btn btn-secondary" data-action="documento">📤 Subir documento</button>
        </div>
      </div>
    </div>
  `;

  renderAgendaList(citasHoy, pacientesById);
  renderPacientesRecientes(pacientes, citas);
  renderSeguimientos(alertasActivas);
  renderLineChart(consultas);
  renderDonut(consultas);
  wireQuickActions(container);
}

function renderAgendaList(citasHoy, pacientesById) {
  const el = document.getElementById('dash-agenda-list');
  if (!el) return;
  const items = citasHoy.slice(0, 6);
  if (!items.length) {
    el.innerHTML = '<div class="empty-state">No hay citas programadas para hoy.</div>';
    return;
  }
  el.innerHTML = items
    .map((cita) => {
      const paciente = cita.pacienteId ? pacientesById[cita.pacienteId] : null;
      const label = paciente ? `${paciente.nombre} ${paciente.apellidos}` : cita.motivo;
      return `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 0; border-bottom:1px solid var(--border-color);">
          <div style="display:flex; align-items:center; gap:12px; min-width:0;">
            <strong style="font-size:12.5px; color:var(--text-secondary); min-width:44px;">${cita.horaInicio}</strong>
            <div style="min-width:0;">
              <div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(label)}</div>
              <div class="text-tertiary" style="font-size:11.5px;">${escapeHtml(paciente ? cita.motivo : '')}</div>
            </div>
          </div>
          <span class="badge ${statusBadgeClass(cita.estado)}">${statusLabel(cita.estado)}</span>
        </div>
      `;
    })
    .join('');
}

function renderPacientesRecientes(pacientes, citas) {
  const el = document.getElementById('dash-pacientes-list');
  if (!el) return;
  const recientes = [...pacientes]
    .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
    .slice(0, 5);

  el.innerHTML = recientes
    .map((p) => {
      const cita = citas.find((c) => c.pacienteId === p.id && c.fecha === DEMO_TODAY);
      const meta = cita ? `Hoy, ${cita.horaInicio} · ${cita.motivo}` : `Registrado ${formatDate(p.fechaRegistro)}`;
      return `
        <a href="#/pacientes/${p.id}" style="display:flex; align-items:center; gap:12px; padding:6px 0; text-decoration:none; color:inherit;">
          <span class="avatar-initials" style="width:38px;height:38px;">${initials(p.nombre + ' ' + p.apellidos)}</span>
          <div style="min-width:0;">
            <div style="font-size:13px; font-weight:600;">${escapeHtml(p.nombre)} ${escapeHtml(p.apellidos)}</div>
            <div class="text-tertiary" style="font-size:11.5px;">${escapeHtml(meta)}</div>
          </div>
        </a>
      `;
    })
    .join('');
}

function renderSeguimientos(alertasActivas) {
  const el = document.getElementById('dash-seguimientos-list');
  if (!el) return;
  if (!alertasActivas.length) {
    el.innerHTML = '<div class="empty-state">Sin seguimientos pendientes.</div>';
    return;
  }
  el.innerHTML = alertasActivas
    .slice(0, 5)
    .map(
      (a) => `
        <a href="#/historia-clinica/${a.paciente.id}" style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; text-decoration:none; color:inherit;">
          <div>
            <div style="font-size:13px; font-weight:600;">${escapeHtml(a.paciente.nombre)} ${escapeHtml(a.paciente.apellidos)}</div>
            <div class="text-tertiary" style="font-size:11.5px;">${escapeHtml(a.tipo)}</div>
          </div>
          <span class="badge badge-warning">${escapeHtml(a.descripcion)}</span>
        </a>
      `
    )
    .join('');
}

function renderLineChart(consultas) {
  const el = document.getElementById('dash-line-chart');
  if (!el) return;
  const anchor = new Date(`${DEMO_TODAY}T00:00:00`);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  const counts = days.map((d) => {
    const key = d.toISOString().slice(0, 10);
    const count = consultas.filter((c) => c.fecha.slice(0, 10) === key).length;
    return { label: WEEKDAY_LABELS[d.getDay()], value: count };
  });
  const total = counts.reduce((s, c) => s + c.value, 0);

  el.innerHTML = `
    ${lineChartSvg({ points: counts, width: 440, height: 140 })}
    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:8px;">
      <strong style="font-size:22px;">${total}</strong>
      <span class="text-tertiary" style="font-size:12px;">Total de consultas (últimos 7 días de la demo)</span>
    </div>
  `;
}

function renderDonut(consultas) {
  const el = document.getElementById('dash-donut');
  if (!el) return;
  const counts = new Map();
  consultas.forEach((c) => {
    c.diagnosticos.forEach((d) => {
      counts.set(d.descripcion, (counts.get(d.descripcion) || 0) + 1);
    });
  });
  const segments = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

  if (!segments.length) {
    el.innerHTML = '<div class="empty-state">Sin diagnósticos registrados.</div>';
    return;
  }

  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const legend = segments
    .map(
      (seg, i) => `
        <div style="display:flex; align-items:center; gap:8px; font-size:12.5px; margin-bottom:6px;">
          <span style="width:10px;height:10px;border-radius:50%;background:${chartColor(i)};display:inline-block;"></span>
          <span style="flex:1;">${escapeHtml(seg.label)}</span>
          <span class="text-tertiary">${seg.value} (${Math.round((seg.value / total) * 100)}%)</span>
        </div>
      `
    )
    .join('');

  el.innerHTML = `
    ${donutChartSvg({ segments })}
    <div style="flex:1; min-width:180px;">${legend}</div>
  `;
}

function wireQuickActions(container) {
  const map = {
    'nuevo-paciente': '#/pacientes?action=nuevo',
    'nueva-consulta': '#/pacientes?action=consulta',
    receta: '#/recetas?action=nueva',
    documento: '#/documentos?action=subir'
  };
  container.querySelectorAll('[data-action]').forEach((btn) => {
    const handler = () => navigateTo(map[btn.dataset.action]);
    btn.addEventListener('click', handler);
    cleanupFns.push(() => btn.removeEventListener('click', handler));
  });
}

export function unmount() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
}
