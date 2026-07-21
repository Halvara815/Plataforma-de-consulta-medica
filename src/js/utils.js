let idCounters = {};

export function generateId(prefix) {
  const key = prefix;
  idCounters[key] = (idCounters[key] || Date.now() % 100000) + 1;
  const n = idCounters[key].toString().padStart(4, '0');
  return `${prefix}-${n}`;
}

export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Los strings de solo-fecha ("YYYY-MM-DD") se parsean como medianoche LOCAL en lugar de
// dejar que `new Date()` los interprete como UTC, lo que en husos horarios negativos
// (como México) provocaría que la fecha mostrada retroceda un día.
function parseDateLocal(dateStr) {
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (dateOnlyMatch) {
    const [, y, m, d] = dateOnlyMatch;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  return new Date(dateStr);
}

export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '';
  const date = parseDateLocal(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  const { withTime = false } = options;
  const datePart = date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  if (!withTime) return datePart;
  const timePart = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  return `${datePart} · ${timePart}`;
}

export function calcAge(birthDateStr) {
  if (!birthDateStr) return null;
  const birth = parseDateLocal(birthDateStr);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export function calcIMC(pesoKg, tallaCm) {
  if (!pesoKg || !tallaCm) return null;
  const tallaM = tallaCm / 100;
  const imc = pesoKg / (tallaM * tallaM);
  return Math.round(imc * 10) / 10;
}

export function debounce(fn, wait = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function initials(fullName = '') {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export function classNames(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function parseQuery(queryStr = '') {
  const params = new URLSearchParams(queryStr);
  const out = {};
  for (const [key, value] of params.entries()) out[key] = value;
  return out;
}

export function el(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

export function statusBadgeClass(status) {
  const map = {
    confirmada: 'badge-success',
    pendiente: 'badge-warning',
    en_consulta: 'badge-info',
    cancelada: 'badge-danger',
    no_asistio: 'badge-danger',
    bloqueado: 'badge',
    administrativo: 'badge',
    activo: 'badge-success',
    inactivo: 'badge',
    solicitado: 'badge-warning',
    en_proceso: 'badge-info',
    completado: 'badge-success'
  };
  return map[status] || 'badge';
}

const CHART_COLORS = ['#2563eb', '#0d9488', '#16a34a', '#d97706', '#94a3b8', '#4f46e5'];

export function lineChartSvg({ points, width = 480, height = 160, color = 'var(--color-primary)' }) {
  if (!points.length) return '';
  const max = Math.max(...points.map((p) => p.value), 1);
  const stepX = width / Math.max(points.length - 1, 1);
  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - (p.value / max) * (height - 24) - 4;
    return { x, y, ...p };
  });
  const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L${coords[coords.length - 1].x.toFixed(1)},${height} L0,${height} Z`;

  const dots = coords
    .map(
      (c) =>
        `<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="3.5" fill="${color}"><title>${escapeHtml(c.label)}: ${c.value}</title></circle>`
    )
    .join('');
  const labels = coords
    .map((c) => `<text x="${c.x.toFixed(1)}" y="${height + 16}" font-size="10" text-anchor="middle" fill="var(--text-tertiary)">${escapeHtml(c.label)}</text>`)
    .join('');

  return `
    <svg viewBox="0 0 ${width} ${height + 24}" width="100%" height="${height + 24}" role="img" aria-label="Gráfica de tendencia">
      <path d="${areaD}" fill="${color}" opacity="0.08"></path>
      <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
      ${dots}
      ${labels}
    </svg>
  `;
}

export function donutChartSvg({ segments, size = 160, thickness = 22 }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const arcs = segments
    .map((seg, i) => {
      const fraction = seg.value / total;
      const dash = fraction * circumference;
      const gap = circumference - dash;
      const rotation = (offset / total) * 360;
      offset += seg.value;
      const color = seg.color || CHART_COLORS[i % CHART_COLORS.length];
      return `<circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="${color}" stroke-width="${thickness}" stroke-dasharray="${dash} ${gap}" transform="rotate(${rotation - 90} ${size / 2} ${size / 2})"><title>${escapeHtml(seg.label)}: ${seg.value}</title></circle>`;
    })
    .join('');

  return `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Gráfica de distribución">
      ${arcs}
      <text x="${size / 2}" y="${size / 2 - 4}" text-anchor="middle" font-size="20" font-weight="700" fill="var(--text-primary)">${total}</text>
      <text x="${size / 2}" y="${size / 2 + 14}" text-anchor="middle" font-size="10" fill="var(--text-tertiary)">Total</text>
    </svg>
  `;
}

export function chartColor(index) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export function statusLabel(status) {
  const map = {
    confirmada: 'Confirmada',
    pendiente: 'Pendiente',
    en_consulta: 'En consulta',
    cancelada: 'Cancelada',
    no_asistio: 'No asistió',
    bloqueado: 'Bloqueado',
    administrativo: 'Administrativo',
    activo: 'Activo',
    inactivo: 'Inactivo',
    solicitado: 'Solicitado',
    en_proceso: 'En proceso',
    completado: 'Completado'
  };
  return map[status] || status;
}
