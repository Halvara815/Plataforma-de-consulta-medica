export function render(panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Superficie Corporal (fórmula de Mosteller)</h2></div>
      <div class="form-grid">
        <div class="form-field">
          <label for="sc-peso">Peso (kg)</label>
          <input class="input" type="number" id="sc-peso" min="0" step="0.1" placeholder="70" />
        </div>
        <div class="form-field">
          <label for="sc-talla">Talla (cm)</label>
          <input class="input" type="number" id="sc-talla" min="0" step="0.1" placeholder="170" />
        </div>
      </div>
      <div id="sc-resultado" style="margin-top:16px;"></div>
      <p class="text-tertiary" style="font-size:11.5px; margin-top:10px;">SC (m²) = √((talla en cm × peso en kg) / 3600)</p>
    </div>
  `;

  const pesoInput = panelEl.querySelector('#sc-peso');
  const tallaInput = panelEl.querySelector('#sc-talla');
  const resultadoEl = panelEl.querySelector('#sc-resultado');

  function recalcular() {
    const peso = parseFloat(pesoInput.value);
    const talla = parseFloat(tallaInput.value);
    if (!peso || !talla) {
      resultadoEl.innerHTML = '';
      return;
    }
    const sc = Math.sqrt((talla * peso) / 3600);
    resultadoEl.innerHTML = `<div class="calc-display" style="text-align:left;">${sc.toFixed(2)} <span style="font-size:14px; font-weight:400; color:var(--text-tertiary);">m²</span></div>`;
  }

  pesoInput.addEventListener('input', recalcular);
  tallaInput.addEventListener('input', recalcular);
}
