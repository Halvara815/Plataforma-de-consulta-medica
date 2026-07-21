export function render(panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Goteo intravenoso</h2></div>
      <div class="form-grid">
        <div class="form-field">
          <label for="giv-volumen">Volumen total (mL)</label>
          <input class="input" type="number" id="giv-volumen" min="0" step="1" placeholder="1000" />
        </div>
        <div class="form-field">
          <label for="giv-tiempo">Tiempo de infusión (horas)</label>
          <input class="input" type="number" id="giv-tiempo" min="0" step="0.1" placeholder="8" />
        </div>
        <div class="form-field">
          <label for="giv-factor">Factor de goteo</label>
          <select class="input" id="giv-factor">
            <option value="20">Macrogotero (20 gtt/mL)</option>
            <option value="60">Microgotero (60 gtt/mL)</option>
            <option value="10">Macrogotero (10 gtt/mL)</option>
            <option value="15">Macrogotero (15 gtt/mL)</option>
          </select>
        </div>
      </div>
      <div id="giv-resultado" style="margin-top:16px;"></div>
    </div>
  `;

  const volumenInput = panelEl.querySelector('#giv-volumen');
  const tiempoInput = panelEl.querySelector('#giv-tiempo');
  const factorInput = panelEl.querySelector('#giv-factor');
  const resultadoEl = panelEl.querySelector('#giv-resultado');

  function recalcular() {
    const volumen = parseFloat(volumenInput.value);
    const tiempo = parseFloat(tiempoInput.value);
    const factor = parseFloat(factorInput.value);
    if (!volumen || !tiempo) {
      resultadoEl.innerHTML = '';
      return;
    }
    const mlPorHora = volumen / tiempo;
    const gotasPorMin = (volumen * factor) / (tiempo * 60);
    resultadoEl.innerHTML = `
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Velocidad de infusión</div><div class="info-value">${mlPorHora.toFixed(1)} mL/h</div></div>
        <div class="info-item"><div class="info-label">Ritmo de goteo</div><div class="info-value">${gotasPorMin.toFixed(0)} gotas/min</div></div>
      </div>
    `;
  }

  [volumenInput, tiempoInput, factorInput].forEach((el) => el.addEventListener('input', recalcular));
}
