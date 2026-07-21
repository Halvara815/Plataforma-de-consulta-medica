import { query as queryCollection } from '../../services/dataService.js';
import { formatDate, lineChartSvg } from '../../utils.js';

export function render(paciente, panelEl) {
  const consultas = queryCollection('consultas', (c) => c.pacienteId === paciente.id).sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha)
  );
  const ultima = consultas[consultas.length - 1];

  const pesoPoints = consultas
    .filter((c) => c.signosVitales?.peso)
    .map((c) => ({ label: formatDate(c.fecha), value: Number(c.signosVitales.peso) }));

  panelEl.innerHTML = `
    ${
      ultima
        ? `<div class="card">
            <div class="card-header"><h2>Últimos signos vitales (${formatDate(ultima.fecha, { withTime: true })})</h2></div>
            <div class="info-grid">
              <div class="info-item"><div class="info-label">TA</div><div class="info-value">${ultima.signosVitales.ta} mmHg</div></div>
              <div class="info-item"><div class="info-label">FC</div><div class="info-value">${ultima.signosVitales.fc} lpm</div></div>
              <div class="info-item"><div class="info-label">FR</div><div class="info-value">${ultima.signosVitales.fr} rpm</div></div>
              <div class="info-item"><div class="info-label">Temp.</div><div class="info-value">${ultima.signosVitales.temp} °C</div></div>
              <div class="info-item"><div class="info-label">SpO₂</div><div class="info-value">${ultima.signosVitales.spo2} %</div></div>
              <div class="info-item"><div class="info-label">Peso</div><div class="info-value">${ultima.signosVitales.peso} kg</div></div>
              <div class="info-item"><div class="info-label">Talla</div><div class="info-value">${ultima.signosVitales.talla} cm</div></div>
              <div class="info-item"><div class="info-label">IMC</div><div class="info-value">${ultima.signosVitales.imc} kg/m²</div></div>
            </div>
          </div>`
        : '<div class="empty-state">Sin signos vitales registrados.</div>'
    }
    ${
      pesoPoints.length > 1
        ? `<div class="card">
            <div class="card-header"><h2>Tendencia de peso</h2></div>
            ${lineChartSvg({ points: pesoPoints, color: 'var(--color-accent)' })}
          </div>`
        : ''
    }
  `;
}
