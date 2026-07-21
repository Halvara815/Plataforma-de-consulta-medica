import { calcIMC } from '../../utils.js';

function categoriaImc(imc) {
  if (imc < 18.5) return { label: 'Bajo peso', tone: 'badge-info' };
  if (imc < 25) return { label: 'Normal', tone: 'badge-success' };
  if (imc < 30) return { label: 'Sobrepeso', tone: 'badge-warning' };
  if (imc < 35) return { label: 'Obesidad grado I', tone: 'badge-danger' };
  if (imc < 40) return { label: 'Obesidad grado II', tone: 'badge-danger' };
  return { label: 'Obesidad grado III', tone: 'badge-danger' };
}

export function render(panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Índice de Masa Corporal (IMC)</h2></div>
      <div class="form-grid">
        <div class="form-field">
          <label for="imc-peso">Peso (kg)</label>
          <input class="input" type="number" id="imc-peso" min="0" step="0.1" placeholder="70" />
        </div>
        <div class="form-field">
          <label for="imc-talla">Talla (cm)</label>
          <input class="input" type="number" id="imc-talla" min="0" step="0.1" placeholder="170" />
        </div>
      </div>
      <div id="imc-resultado" style="margin-top:16px;"></div>
    </div>
  `;

  const pesoInput = panelEl.querySelector('#imc-peso');
  const tallaInput = panelEl.querySelector('#imc-talla');
  const resultadoEl = panelEl.querySelector('#imc-resultado');

  function recalcular() {
    const peso = parseFloat(pesoInput.value);
    const talla = parseFloat(tallaInput.value);
    const imc = calcIMC(peso, talla);
    if (!imc) {
      resultadoEl.innerHTML = '';
      return;
    }
    const cat = categoriaImc(imc);
    resultadoEl.innerHTML = `
      <div class="calc-display" style="text-align:left;">${imc} <span style="font-size:14px; font-weight:400; color:var(--text-tertiary);">kg/m²</span></div>
      <span class="badge ${cat.tone}" style="margin-top:8px;">${cat.label}</span>
    `;
  }

  pesoInput.addEventListener('input', recalcular);
  tallaInput.addEventListener('input', recalcular);
}
