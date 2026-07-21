import { evaluateExpression } from './mathExpr.js';

const BASIC_KEYS = [
  { label: 'C', action: 'clear', cls: 'calc-op' },
  { label: '(', action: 'append', value: '(' },
  { label: ')', action: 'append', value: ')' },
  { label: '÷', action: 'append', value: '/', cls: 'calc-op' },
  { label: '7', action: 'append', value: '7' },
  { label: '8', action: 'append', value: '8' },
  { label: '9', action: 'append', value: '9' },
  { label: '×', action: 'append', value: '*', cls: 'calc-op' },
  { label: '4', action: 'append', value: '4' },
  { label: '5', action: 'append', value: '5' },
  { label: '6', action: 'append', value: '6' },
  { label: '−', action: 'append', value: '-', cls: 'calc-op' },
  { label: '1', action: 'append', value: '1' },
  { label: '2', action: 'append', value: '2' },
  { label: '3', action: 'append', value: '3' },
  { label: '+', action: 'append', value: '+', cls: 'calc-op' },
  { label: '⌫', action: 'backspace' },
  { label: '0', action: 'append', value: '0' },
  { label: '.', action: 'append', value: '.' },
  { label: '=', action: 'equals', cls: 'calc-equals' }
];

const SCIENTIFIC_KEYS = [
  { label: 'sin', action: 'append', value: 'sin(', cls: 'calc-fn' },
  { label: 'cos', action: 'append', value: 'cos(', cls: 'calc-fn' },
  { label: 'tan', action: 'append', value: 'tan(', cls: 'calc-fn' },
  { label: 'log', action: 'append', value: 'log(', cls: 'calc-fn' },
  { label: 'ln', action: 'append', value: 'ln(', cls: 'calc-fn' },
  { label: '√', action: 'append', value: 'sqrt(', cls: 'calc-fn' },
  { label: 'xʸ', action: 'append', value: '^', cls: 'calc-fn' },
  { label: 'π', action: 'append', value: 'pi', cls: 'calc-fn' },
  { label: 'e', action: 'append', value: 'e', cls: 'calc-fn' },
  { label: '%', action: 'append', value: '%', cls: 'calc-fn' }
];

export function mountCalculator(panelEl, { scientific = false } = {}) {
  let expression = '';

  panelEl.innerHTML = `
    <div class="card">
      <div class="calc-expression" id="calc-expr"></div>
      <div class="calc-display" id="calc-display">0</div>
      <div style="height:12px;"></div>
      ${scientific ? `<div class="calc-keypad" style="margin-bottom:8px;">${SCIENTIFIC_KEYS.map(keyHtml).join('')}</div>` : ''}
      <div class="calc-keypad">${BASIC_KEYS.map(keyHtml).join('')}</div>
    </div>
  `;

  const displayEl = panelEl.querySelector('#calc-display');
  const exprEl = panelEl.querySelector('#calc-expr');

  function keyHtml(key) {
    return `<button type="button" class="calc-btn ${key.cls || ''}" data-action="${key.action}" data-value="${key.value || ''}">${key.label}</button>`;
  }

  function updateDisplay() {
    exprEl.textContent = expression;
    if (!expression) {
      displayEl.textContent = '0';
      return;
    }
    try {
      const result = evaluateExpression(expression);
      displayEl.textContent = trimNumber(result);
    } catch {
      displayEl.textContent = expression;
    }
  }

  function trimNumber(n) {
    if (!Number.isFinite(n)) return 'Error';
    const rounded = Math.round(n * 1e10) / 1e10;
    return String(rounded);
  }

  panelEl.querySelectorAll('.calc-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const { action, value } = btn.dataset;
      if (action === 'append') expression += value;
      else if (action === 'clear') expression = '';
      else if (action === 'backspace') expression = expression.slice(0, -1);
      else if (action === 'equals') {
        try {
          expression = trimNumber(evaluateExpression(expression));
        } catch {
          displayEl.textContent = 'Error';
          exprEl.textContent = 'Expresión inválida';
          return;
        }
      }
      updateDisplay();
    });
  });

  updateDisplay();
}
