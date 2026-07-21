export function render(panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Cálculo de dosis</h2></div>
      <div class="form-grid">
        <div class="form-field">
          <label for="dosis-peso">Peso del paciente (kg)</label>
          <input class="input" type="number" id="dosis-peso" min="0" step="0.1" placeholder="20" />
        </div>
        <div class="form-field">
          <label for="dosis-mgkg">Dosis prescrita (mg/kg)</label>
          <input class="input" type="number" id="dosis-mgkg" min="0" step="0.01" placeholder="10" />
        </div>
        <div class="form-field">
          <label for="dosis-conc">Concentración disponible (mg/mL)</label>
          <input class="input" type="number" id="dosis-conc" min="0" step="0.01" placeholder="5" />
        </div>
      </div>
      <div id="dosis-resultado" style="margin-top:16px;"></div>
    </div>
  `;

  const pesoInput = panelEl.querySelector('#dosis-peso');
  const mgkgInput = panelEl.querySelector('#dosis-mgkg');
  const concInput = panelEl.querySelector('#dosis-conc');
  const resultadoEl = panelEl.querySelector('#dosis-resultado');

  function recalcular() {
    const peso = parseFloat(pesoInput.value);
    const mgkg = parseFloat(mgkgInput.value);
    const conc = parseFloat(concInput.value);
    if (!peso || !mgkg) {
      resultadoEl.innerHTML = '';
      return;
    }
    const dosisTotal = peso * mgkg;
    const volumen = conc ? dosisTotal / conc : null;
    resultadoEl.innerHTML = `
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Dosis total</div><div class="info-value">${dosisTotal.toFixed(2)} mg</div></div>
        ${volumen !== null ? `<div class="info-item"><div class="info-label">Volumen a administrar</div><div class="info-value">${volumen.toFixed(2)} mL</div></div>` : ''}
      </div>
    `;
  }

  [pesoInput, mgkgInput, concInput].forEach((el) => el.addEventListener('input', recalcular));
}
