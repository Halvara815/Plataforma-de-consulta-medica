import { formatDate } from '../../utils.js';

function parseDateLocal(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function render(panelEl) {
  panelEl.innerHTML = `
    <div class="card">
      <div class="card-header"><h2>Edad gestacional</h2></div>
      <div class="form-grid">
        <div class="form-field">
          <label for="eg-fum">Fecha de última menstruación (FUM)</label>
          <input class="input" type="date" id="eg-fum" />
        </div>
        <div class="form-field">
          <label for="eg-referencia">Calcular a partir de</label>
          <input class="input" type="date" id="eg-referencia" />
        </div>
      </div>
      <div id="eg-resultado" style="margin-top:16px;"></div>
      <p class="text-tertiary" style="font-size:11.5px; margin-top:10px;">Fecha probable de parto calculada con la regla de Naegele (FUM + 280 días).</p>
    </div>
  `;

  const fumInput = panelEl.querySelector('#eg-fum');
  const refInput = panelEl.querySelector('#eg-referencia');
  const resultadoEl = panelEl.querySelector('#eg-resultado');
  refInput.value = new Date().toISOString().slice(0, 10);

  function recalcular() {
    if (!fumInput.value || !refInput.value) {
      resultadoEl.innerHTML = '';
      return;
    }
    const fum = parseDateLocal(fumInput.value);
    const referencia = parseDateLocal(refInput.value);
    const diffDias = Math.round((referencia - fum) / 86400000);
    if (diffDias < 0) {
      resultadoEl.innerHTML = '<div class="empty-state">La fecha de referencia es anterior a la FUM.</div>';
      return;
    }
    const semanas = Math.floor(diffDias / 7);
    const dias = diffDias % 7;
    const fpp = new Date(fum);
    fpp.setDate(fpp.getDate() + 280);

    resultadoEl.innerHTML = `
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Edad gestacional</div><div class="info-value">${semanas} semanas, ${dias} días</div></div>
        <div class="info-item"><div class="info-label">Fecha probable de parto</div><div class="info-value">${formatDate(fpp.toISOString().slice(0, 10))}</div></div>
        <div class="info-item"><div class="info-label">Trimestre</div><div class="info-value">${semanas < 13 ? '1º' : semanas < 27 ? '2º' : '3º'}</div></div>
      </div>
    `;
  }

  fumInput.addEventListener('input', recalcular);
  refInput.addEventListener('input', recalcular);
}
