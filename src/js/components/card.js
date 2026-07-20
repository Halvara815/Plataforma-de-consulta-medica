import { escapeHtml } from '../utils.js';

export function metricCardHtml({ label, value, icon = '', trend = '', trendDirection = '', tone = 'primary' }) {
  const trendClass = trendDirection ? ` ${trendDirection}` : '';
  return `
    <div class="card metric-card">
      <div class="metric-label">
        <span class="metric-icon badge-${tone}" style="background:var(--color-${tone}-soft, var(--color-primary-soft)); color:var(--color-${tone}, var(--color-primary));">${icon}</span>
        ${escapeHtml(label)}
      </div>
      <div class="metric-value">${value}</div>
      ${trend ? `<div class="metric-trend${trendClass}">${escapeHtml(trend)}</div>` : ''}
    </div>
  `;
}

export function cardHtml({ title, actionsHtml = '', bodyHtml = '', id = '' }) {
  return `
    <section class="card"${id ? ` id="${id}"` : ''}>
      ${
        title
          ? `<div class="card-header"><h2>${escapeHtml(title)}</h2>${actionsHtml ? `<div class="view-actions">${actionsHtml}</div>` : ''}</div>`
          : ''
      }
      ${bodyHtml}
    </section>
  `;
}
