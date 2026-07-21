import { getAll } from '../../services/dataService.js';
import { icon } from '../../icons.js';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function render(panelEl) {
  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();

  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h2 id="cal-title"></h2>
        <div class="view-actions">
          <button type="button" class="btn btn-secondary btn-sm" id="cal-prev">${icon('chevron-left', { size: 14 })}</button>
          <button type="button" class="btn btn-secondary btn-sm" id="cal-next">${icon('chevron-right', { size: 14 })}</button>
        </div>
      </div>
      <div class="calendar-grid" style="margin-bottom:4px;">
        ${DIAS.map((d) => `<div style="text-align:center; font-size:11px; color:var(--text-tertiary); font-weight:600;">${d}</div>`).join('')}
      </div>
      <div class="calendar-grid" id="cal-grid"></div>
    </div>
  `;

  const titleEl = panelEl.querySelector('#cal-title');
  const gridEl = panelEl.querySelector('#cal-grid');

  function draw() {
    titleEl.textContent = `${MESES[viewMonth]} ${viewYear}`;
    const citas = getAll('citas');
    const citasPorDia = new Map();
    citas.forEach((c) => {
      const count = citasPorDia.get(c.fecha) || 0;
      citasPorDia.set(c.fecha, count + 1);
    });

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = (firstOfMonth.getDay() + 6) % 7; // lunes = 0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    gridEl.innerHTML = cells
      .map((day) => {
        if (!day) return '<div></div>';
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dateStr === today.toISOString().slice(0, 10);
        const hasCitas = citasPorDia.has(dateStr);
        return `<div class="calendar-day${isToday ? ' is-today' : ''}"><span>${day}</span>${hasCitas ? '<span class="dot" title="Citas agendadas"></span>' : ''}</div>`;
      })
      .join('');
  }

  panelEl.querySelector('#cal-prev').addEventListener('click', () => {
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    draw();
  });
  panelEl.querySelector('#cal-next').addEventListener('click', () => {
    viewMonth += 1;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
    draw();
  });

  draw();
}
