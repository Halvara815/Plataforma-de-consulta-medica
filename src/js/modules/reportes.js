import { getAll, getById } from '../services/dataService.js';
import { setTopbarTitle } from '../components/topbar.js';
import { metricCardHtml, cardHtml } from '../components/card.js';
import { chartColor, donutChartSvg, escapeHtml, lineChartSvg, statusBadgeClass, statusLabel } from '../utils.js';
import { icon } from '../icons.js';

let cleanupFns = [];

export async function mount(container) {
  setTopbarTitle('Reportes', 'Indicadores clínicos, productividad y estadísticas de la clínica');

  const pacientes = getAll('pacientes');
  const consultas = getAll('consultas');
  const recetas = getAll('recetas');
  const citas = getAll('citas');
  const estudios = getAll('estudios');

  container.innerHTML = `
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Reportes</h1>
          <p>Indicadores clínicos, productividad y estadísticas de la clínica (datos de demostración)</p>
        </div>
      </div>

      <div class="card-grid">
        ${metricCardHtml({ label: 'Consultas registradas', value: consultas.length, icon: icon('stethoscope'), tone: 'primary' })}
        ${metricCardHtml({ label: 'Pacientes activos', value: pacientes.filter((p) => p.estado === 'activo').length, icon: icon('users'), tone: 'accent' })}
        ${metricCardHtml({ label: 'Recetas emitidas', value: recetas.length, icon: icon('pill'), tone: 'success' })}
        ${metricCardHtml({ label: 'Estudios solicitados', value: estudios.length, icon: icon('flask'), tone: 'warning' })}
      </div>

      <div class="two-col">
        ${cardHtml({ title: 'Consultas por día', bodyHtml: `<div id="report-line"></div>` })}
        ${cardHtml({ title: 'Diagnósticos más frecuentes', bodyHtml: `<div id="report-donut" style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;"></div>` })}
      </div>

      <div class="two-col">
        ${cardHtml({ title: 'Citas por estado', bodyHtml: `<div id="report-estado-bars" class="stack" style="gap:10px;"></div>` })}
        ${cardHtml({ title: 'Consultas por médico', bodyHtml: `<div id="report-medico-bars" class="stack" style="gap:10px;"></div>` })}
      </div>
    </div>
  `;

  renderLineChart(consultas);
  renderDonut(consultas);
  renderEstadoBars(citas);
  renderMedicoBars(consultas);
}

function renderLineChart(consultas) {
  const el = document.getElementById('report-line');
  const byDate = new Map();
  consultas.forEach((c) => {
    const key = c.fecha.slice(0, 10);
    byDate.set(key, (byDate.get(key) || 0) + 1);
  });
  const dates = [...byDate.keys()].sort();
  const points = dates.map((d) => ({
    label: d.slice(5),
    value: byDate.get(d)
  }));
  el.innerHTML = points.length
    ? lineChartSvg({ points, width: 440, height: 150 })
    : '<div class="empty-state">Sin consultas registradas.</div>';
}

function renderDonut(consultas) {
  const el = document.getElementById('report-donut');
  const counts = new Map();
  consultas.forEach((c) => {
    c.diagnosticos.forEach((d) => counts.set(d.descripcion, (counts.get(d.descripcion) || 0) + 1));
  });
  const segments = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }));
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
  el.innerHTML = `${donutChartSvg({ segments })}<div style="flex:1; min-width:180px;">${legend}</div>`;
}

function renderBarList(el, entries, colorFn, labelFn) {
  const max = Math.max(...entries.map(([, count]) => count), 1);
  el.innerHTML = entries
    .map(([key, count], i) => {
      const pct = Math.round((count / max) * 100);
      return `
        <div>
          <div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:4px;">
            <span>${labelFn(key)}</span>
            <strong>${count}</strong>
          </div>
          <div style="height:8px; border-radius:var(--radius-full); background:var(--bg-surface-alt); overflow:hidden;">
            <div style="height:100%; width:${pct}%; background:${colorFn(i, key)}; border-radius:var(--radius-full);"></div>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderEstadoBars(citas) {
  const el = document.getElementById('report-estado-bars');
  const counts = new Map();
  citas.forEach((c) => counts.set(c.estado, (counts.get(c.estado) || 0) + 1));
  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    el.innerHTML = '<div class="empty-state">Sin citas registradas.</div>';
    return;
  }
  renderBarList(el, entries, () => 'var(--color-primary)', statusLabel);
}

function renderMedicoBars(consultas) {
  const el = document.getElementById('report-medico-bars');
  const counts = new Map();
  consultas.forEach((c) => counts.set(c.medicoId, (counts.get(c.medicoId) || 0) + 1));
  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    el.innerHTML = '<div class="empty-state">Sin consultas registradas.</div>';
    return;
  }
  renderBarList(el, entries, () => 'var(--color-accent)', (medicoId) => getById('medicos', medicoId)?.nombre || medicoId);
}

export function unmount() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
}
