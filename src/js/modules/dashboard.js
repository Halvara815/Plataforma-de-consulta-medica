import { getDashboardMetrics } from '../services/dataService.js';
import { setTopbarTitle } from '../components/topbar.js';
import { metricCardHtml, cardHtml } from '../components/card.js';
import { navigateTo } from '../router.js';
import { chartColor, donutChartSvg, escapeHtml, formatDate, initials, lineChartSvg, statusBadgeClass, statusLabel } from '../utils.js';
import { icon } from '../icons.js';

let cleanupFns = [];

function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export async function mount(container) {
  setTopbarTitle('Panel General', 'Resumen de la actividad clínica de hoy');
  const metrics = await getDashboardMetrics({ fecha: localToday() });
  const citas = metrics.citas?.items || [];
  const proximaCita = citas.find((cita) => cita.pacienteId);
  const alertas = metrics.seguimientos?.alertas || [];
  const estudiosPendientes = metrics.seguimientos?.estudiosPendientes || 0;

  container.innerHTML = `
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Panel General</h1>
          <p>Resumen de la actividad clínica de hoy</p>
        </div>
      </div>

      <div class="card-grid">
        ${metricCardHtml({ label: 'Citas de hoy', value: metrics.citas?.total || 0, icon: icon('calendar'), trend: proximaCita ? `Próxima: ${proximaCita.horaInicio}` : 'Sin citas próximas', tone: 'primary' })}
        ${metricCardHtml({ label: 'Pacientes activos', value: metrics.pacientes?.activos || 0, icon: icon('users'), trend: `${metrics.pacientes?.total || 0} en total`, tone: 'accent' })}
        ${metricCardHtml({ label: 'Seguimientos pendientes', value: alertas.length, icon: icon('clipboard-list'), trend: `${estudiosPendientes} estudio(s) en proceso`, tone: 'warning' })}
        ${metricCardHtml({ label: 'Recetas emitidas', value: metrics.recetasEmitidas || 0, icon: icon('pill'), trend: 'Acumulado', tone: 'success' })}
        ${metricCardHtml({ label: 'Alertas clínicas', value: alertas.length + estudiosPendientes, icon: icon('alert-triangle'), trend: 'Requieren atención', tone: 'danger' })}
      </div>

      <div class="two-col">
        <div class="stack">
          ${cardHtml({ title: 'Agenda de hoy', actionsHtml: '<a href="#/agenda" class="btn btn-ghost btn-sm">Ver agenda completa</a>', bodyHtml: '<div id="dash-agenda-list" class="stack"></div>' })}
          ${cardHtml({ title: 'Consultas esta semana', bodyHtml: '<div id="dash-line-chart"></div>' })}
        </div>
        <div class="stack">
          ${cardHtml({ title: 'Pacientes recientes', actionsHtml: '<a href="#/pacientes" class="btn btn-ghost btn-sm">Ver todos</a>', bodyHtml: '<div id="dash-pacientes-list" class="stack"></div>' })}
          ${cardHtml({ title: 'Seguimientos pendientes', bodyHtml: '<div id="dash-seguimientos-list" class="stack"></div>' })}
          ${cardHtml({ title: 'Diagnósticos más frecuentes', bodyHtml: '<div id="dash-donut" style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;"></div>' })}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h2>Acciones rápidas</h2></div>
        <div class="card-grid">
          <button type="button" class="btn btn-secondary" data-action="nuevo-paciente">${icon('plus', { size: 15 })} Nuevo paciente</button>
          <button type="button" class="btn btn-secondary" data-action="nueva-consulta">${icon('stethoscope', { size: 15 })} Nueva consulta</button>
          <button type="button" class="btn btn-secondary" data-action="receta">${icon('pill', { size: 15 })} Receta</button>
          <button type="button" class="btn btn-secondary" data-action="documento">${icon('upload', { size: 15 })} Subir documento</button>
        </div>
      </div>
    </div>
  `;

  renderAgendaList(citas);
  renderPacientesRecientes(metrics.pacientes?.recientes || [], citas);
  renderSeguimientos(alertas);
  renderLineChart(metrics.consultas?.porDia || []);
  renderDonut(metrics.consultas?.diagnosticosFrecuentes || []);
  wireQuickActions(container);
}

function renderAgendaList(citas) {
  const el = document.getElementById('dash-agenda-list');
  if (!citas.length) {
    el.innerHTML = '<div class="empty-state">No hay citas programadas para hoy.</div>';
    return;
  }
  el.innerHTML = citas.slice(0, 6).map((cita) => {
    const label = cita.paciente ? `${cita.paciente.nombre} ${cita.paciente.apellidos}` : cita.motivo;
    return `
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 0; border-bottom:1px solid var(--border-color);">
        <div style="display:flex; align-items:center; gap:12px; min-width:0;">
          <strong style="font-size:12.5px; color:var(--text-secondary); min-width:44px;">${escapeHtml(cita.horaInicio)}</strong>
          <div style="min-width:0;"><div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(label)}</div><div class="text-tertiary" style="font-size:11.5px;">${escapeHtml(cita.motivo || '')}</div></div>
        </div>
        <span class="badge ${statusBadgeClass(cita.estado)}">${statusLabel(cita.estado)}</span>
      </div>`;
  }).join('');
}

function renderPacientesRecientes(pacientes, citas) {
  const el = document.getElementById('dash-pacientes-list');
  if (!pacientes.length) {
    el.innerHTML = '<div class="empty-state">Sin pacientes recientes.</div>';
    return;
  }
  el.innerHTML = pacientes.map((paciente) => {
    const cita = citas.find((item) => item.pacienteId === paciente.id);
    const meta = cita ? `Hoy, ${cita.horaInicio} · ${cita.motivo || ''}` : `Registrado ${formatDate(paciente.fechaRegistro)}`;
    return `<a href="#/pacientes/${paciente.id}" style="display:flex; align-items:center; gap:12px; padding:6px 0; text-decoration:none; color:inherit;"><span class="avatar-initials" style="width:38px;height:38px;">${initials(`${paciente.nombre} ${paciente.apellidos}`)}</span><div style="min-width:0;"><div style="font-size:13px; font-weight:600;">${escapeHtml(paciente.nombre)} ${escapeHtml(paciente.apellidos)}</div><div class="text-tertiary" style="font-size:11.5px;">${escapeHtml(meta)}</div></div></a>`;
  }).join('');
}

function renderSeguimientos(alertas) {
  const el = document.getElementById('dash-seguimientos-list');
  if (!alertas.length) {
    el.innerHTML = '<div class="empty-state">Sin seguimientos pendientes.</div>';
    return;
  }
  el.innerHTML = alertas.map((alerta) => `<a href="#/historia-clinica/${alerta.pacienteId}" style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; text-decoration:none; color:inherit;"><div><div style="font-size:13px; font-weight:600;">${escapeHtml(alerta.nombre)} ${escapeHtml(alerta.apellidos)}</div><div class="text-tertiary" style="font-size:11.5px;">${escapeHtml(alerta.tipo)}</div></div><span class="badge badge-warning">${escapeHtml(alerta.descripcion)}</span></a>`).join('');
}

function renderLineChart(points) {
  const el = document.getElementById('dash-line-chart');
  const total = points.reduce((sum, point) => sum + point.value, 0);
  const chartPoints = points.map((point) => ({ label: formatDate(point.label).slice(0, 3), value: point.value }));
  el.innerHTML = `${lineChartSvg({ points: chartPoints, width: 440, height: 140 })}<div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:8px;"><strong style="font-size:22px;">${total}</strong><span class="text-tertiary" style="font-size:12px;">Total de consultas (últimos 7 días)</span></div>`;
}

function renderDonut(segments) {
  const el = document.getElementById('dash-donut');
  if (!segments.length) {
    el.innerHTML = '<div class="empty-state">Sin diagnósticos registrados.</div>';
    return;
  }
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const legend = segments.map((segment, index) => `<div style="display:flex; align-items:center; gap:8px; font-size:12.5px; margin-bottom:6px;"><span style="width:10px;height:10px;border-radius:50%;background:${chartColor(index)};display:inline-block;"></span><span style="flex:1;">${escapeHtml(segment.label)}</span><span class="text-tertiary">${segment.value} (${Math.round((segment.value / total) * 100)}%)</span></div>`).join('');
  el.innerHTML = `${donutChartSvg({ segments })}<div style="flex:1; min-width:180px;">${legend}</div>`;
}

function wireQuickActions(container) {
  const map = { 'nuevo-paciente': '#/pacientes?action=nuevo', 'nueva-consulta': '#/pacientes?action=consulta', receta: '#/recetas?action=nueva', documento: '#/documentos?action=subir' };
  container.querySelectorAll('[data-action]').forEach((button) => {
    const handler = () => navigateTo(map[button.dataset.action]);
    button.addEventListener('click', handler);
    cleanupFns.push(() => button.removeEventListener('click', handler));
  });
}

export function unmount() {
  cleanupFns.forEach((cleanup) => cleanup());
  cleanupFns = [];
}
