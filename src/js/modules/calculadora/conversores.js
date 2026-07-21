const CATEGORIES = {
  peso: { label: 'Peso', unitA: 'kg', unitB: 'lb', toB: (kg) => kg * 2.20462, toA: (lb) => lb / 2.20462 },
  talla: { label: 'Talla / longitud', unitA: 'cm', unitB: 'in', toB: (cm) => cm / 2.54, toA: (inch) => inch * 2.54 },
  temperatura: { label: 'Temperatura', unitA: '°C', unitB: '°F', toB: (c) => c * 1.8 + 32, toA: (f) => (f - 32) / 1.8 },
  glucosa: { label: 'Glucosa', unitA: 'mg/dL', unitB: 'mmol/L', toB: (mgdl) => mgdl / 18.0182, toA: (mmol) => mmol * 18.0182 }
};

export function render(panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Conversores médicos</h2></div>
      <div class="form-field" style="margin-bottom:16px;">
        <label for="conv-categoria">Tipo de conversión</label>
        <select class="input" id="conv-categoria">
          ${Object.entries(CATEGORIES).map(([key, c]) => `<option value="${key}">${c.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <label id="conv-label-a"></label>
          <input class="input" type="number" id="conv-input-a" step="any" />
        </div>
        <div class="form-field">
          <label id="conv-label-b"></label>
          <input class="input" type="number" id="conv-input-b" step="any" />
        </div>
      </div>
    </div>
  `;

  const categoriaSelect = panelEl.querySelector('#conv-categoria');
  const inputA = panelEl.querySelector('#conv-input-a');
  const inputB = panelEl.querySelector('#conv-input-b');
  const labelA = panelEl.querySelector('#conv-label-a');
  const labelB = panelEl.querySelector('#conv-label-b');

  function applyLabels() {
    const cat = CATEGORIES[categoriaSelect.value];
    labelA.textContent = cat.unitA;
    labelB.textContent = cat.unitB;
  }

  categoriaSelect.addEventListener('change', () => {
    inputA.value = '';
    inputB.value = '';
    applyLabels();
  });

  inputA.addEventListener('input', () => {
    const cat = CATEGORIES[categoriaSelect.value];
    if (inputA.value === '') {
      inputB.value = '';
      return;
    }
    inputB.value = round(cat.toB(parseFloat(inputA.value)));
  });

  inputB.addEventListener('input', () => {
    const cat = CATEGORIES[categoriaSelect.value];
    if (inputB.value === '') {
      inputA.value = '';
      return;
    }
    inputA.value = round(cat.toA(parseFloat(inputB.value)));
  });

  function round(n) {
    return Math.round(n * 100) / 100;
  }

  applyLabels();
}
