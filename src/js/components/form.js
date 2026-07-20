import { escapeHtml } from '../utils.js';

export function textField({ name, label, value = '', type = 'text', required = false, span2 = false, placeholder = '', hint = '' }) {
  return `
    <div class="form-field${span2 ? ' span-2' : ''}">
      <label for="f-${name}">${escapeHtml(label)}${required ? ' *' : ''}</label>
      <input class="input" id="f-${name}" name="${name}" type="${type}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" ${required ? 'required' : ''} />
      ${hint ? `<span class="hint">${escapeHtml(hint)}</span>` : ''}
    </div>
  `;
}

export function textareaField({ name, label, value = '', required = false, span2 = true, rows = 3, placeholder = '' }) {
  return `
    <div class="form-field${span2 ? ' span-2' : ''}">
      <label for="f-${name}">${escapeHtml(label)}${required ? ' *' : ''}</label>
      <textarea class="input" id="f-${name}" name="${name}" rows="${rows}" placeholder="${escapeHtml(placeholder)}" ${required ? 'required' : ''}>${escapeHtml(value)}</textarea>
    </div>
  `;
}

export function selectField({ name, label, value = '', options = [], required = false, span2 = false }) {
  const optionsHtml = options
    .map((opt) => {
      const optValue = typeof opt === 'string' ? opt : opt.value;
      const optLabel = typeof opt === 'string' ? opt : opt.label;
      return `<option value="${escapeHtml(optValue)}" ${String(optValue) === String(value) ? 'selected' : ''}>${escapeHtml(optLabel)}</option>`;
    })
    .join('');
  return `
    <div class="form-field${span2 ? ' span-2' : ''}">
      <label for="f-${name}">${escapeHtml(label)}${required ? ' *' : ''}</label>
      <select class="input" id="f-${name}" name="${name}" ${required ? 'required' : ''}>${optionsHtml}</select>
    </div>
  `;
}

export function radioGroup({ name, label, value = '', options = [] }) {
  const optionsHtml = options
    .map(
      (opt) => `
      <label class="radio-option">
        <input type="radio" name="${name}" value="${escapeHtml(opt.value)}" ${opt.value === value ? 'checked' : ''} />
        ${escapeHtml(opt.label)}
      </label>`
    )
    .join('');
  return `
    <div class="form-field">
      <label>${escapeHtml(label)}</label>
      <div class="radio-group">${optionsHtml}</div>
    </div>
  `;
}

export function getFormData(formEl) {
  const data = new FormData(formEl);
  const out = {};
  for (const [key, value] of data.entries()) out[key] = value;
  return out;
}

export function validateRequired(formEl) {
  const missing = [];
  formEl.querySelectorAll('[required]').forEach((field) => {
    if (!field.value || !field.value.trim()) {
      field.classList.add('has-error');
      missing.push(field.name);
    } else {
      field.classList.remove('has-error');
    }
  });
  return missing.length === 0;
}
