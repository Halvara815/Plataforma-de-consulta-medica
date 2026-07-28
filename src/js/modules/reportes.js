import { getReportMetrics } from '../services/dataService.js';
import { setTopbarTitle } from '../components/topbar.js';
import { metricCardHtml, cardHtml } from '../components/card.js';
import { chartColor, donutChartSvg, escapeHtml, lineChartSvg, statusLabel } from '../utils.js';
import { icon } from '../icons.js';

export async function mount(container) {
  setTopbarTitle('Reportes', 'Indicadores clínicos, productividad y estadísticas de la clínica');
  const metrics = await getReportMetrics();
  const totals = metrics.totales || {};

  container.innerHTML = `
    <div class="view">
      <div class="view-header"><div><h1>Reportes</h1><p>Indicadores clínicos, productividad y estadísticas de la clínica</p></div></div>
      <div class="card-grid">
        ${metricCardHtml({ label: 'Consultas registradas', value: totals.consultas || 0, icon: icon('stethoscope'), tone: 'primary' })}
        ${metricCardHtml({ label: 'Pacientes activos', value: totals.pacientesActivos || 0, icon: icon('users'), tone: 'accent' })}
        ${metricCardHtml({ label: 'Recetas emitidas', value: totals.recetas || 0, icon: icon('pill'), tone: 'success' })}
        ${metricCardHtml({ label: 'Estudios solicitados', value: totals.estudios || 0, icon: icon('flask'), tone: 'warning' })}
      </div>
      <div class="two-col">
        ${cardHtml({ title: 'Consultas por día', bodyHtml: '<div id="report-line"></div>' })}
        ${cardHtml({ title: 'Diagnósticos más frecuentes', bodyHtml: '<div id="report-donut" style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;"></div>' })}
      </div>
      <div class="two-col">
        ${cardHtml({ title: 'Citas por estado', bodyHtml: '<div id="report-estado-bars" class="stack" style="gap:10px;"></div>' })}
        ${cardHtml({ title: 'Consultas por médico', bodyHtml: '<div id="report-medico-bars" class="stack" style="gap:10px;"></div>' })}
      </div>
    </div>`;

  renderLineChart(metrics.consultasPorDia || []);
  renderDonut(metrics.diagnosticosFrecuentes || []);
  renderBarList(document.getElementById('report-estado-bars'), metrics.citasPorEstado || [], () => 'var(--color-primary)', statusLabel, 'Sin citas registradas.');
  renderBarList(document.getElementById('report-medico-bars'), metrics.consultasPorMedico || [], () => 'var(--color-accent)', (label) => label, 'Sin consultas registradas.');
}

function renderLineChart(points) {
  const el = document.getElementById('report-line');
  if (!points.length) {
    el.innerHTML = '<div class="empty-state">Sin consultas registradas.</div>';
    return;
  }
  el.innerHTML = lineChartSvg({ points: points.map((point) => ({ label: point.label.slice(5), value: point.value })), width: 440, height: 150 });
}

function renderDonut(segments) {
  const el = document.getElementById('report-donut');
  if (!segments.length) {
    el.innerHTML = '<div class="empty-state">Sin diagnósticos registrados.</div>';
    return;
  }
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const legend = segments.map((segment, index) => `<div style="display:flex; align-items:center; gap:8px; font-size:12.5px; margin-bottom:6px;"><span style="width:10px;height:10px;border-radius:50%;background:${chartColor(index)};display:inline-block;"></span><span style="flex:1;">${escapeHtml(segment.label)}</span><span class="text-tertiary">${segment.value} (${Math.round((segment.value / total) * 100)}%)</span></div>`).join('');
  el.innerHTML = `${donutChartSvg({ segments })}<div style="flex:1; min-width:180px;">${legend}</div>`;
}

function renderBarList(el, entries, colorFn, labelFn, emptyMessage) {
  if (!entries.length) {
    el.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
    return;
  }
  const max = Math.max(...entries.map((entry) => entry.value), 1);
  el.innerHTML = entries.map((entry, index) => {
    const percent = Math.round((entry.value / max) * 100);
    return `<div><div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:4px;"><span>${escapeHtml(labelFn(entry.label))}</span><strong>${entry.value}</strong></div><div style="height:8px; border-radius:var(--radius-full); background:var(--bg-surface-alt); overflow:hidden;"><div style="height:100%; width:${percent}%; background:${colorFn(index, entry.label)}; border-radius:var(--radius-full);"></div></div></div>`;
  }).join('');
}

export function unmount() {}
