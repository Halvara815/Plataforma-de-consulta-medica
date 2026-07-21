import { query as queryCollection } from '../../services/dataService.js';
import { metricCardHtml } from '../../components/card.js';
import { icon } from '../../icons.js';
import { escapeHtml, formatDate } from '../../utils.js';

export function render(paciente, panelEl) {
  const consultas = queryCollection('consultas', (c) => c.pacienteId === paciente.id).sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );
  const recetas = queryCollection('recetas', (r) => r.pacienteId === paciente.id);
  const documentos = queryCollection('documentos', (d) => d.pacienteId === paciente.id);
  const citas = queryCollection('citas', (c) => c.pacienteId === paciente.id).sort(
    (a, b) => new Date(`${a.fecha}T${a.horaInicio || '00:00'}`) - new Date(`${b.fecha}T${b.horaInicio || '00:00'}`)
  );
  const now = new Date();
  const proxima = citas.find((c) => new Date(`${c.fecha}T${c.horaInicio || '00:00'}`) >= now);
  const alertasActivas = paciente.alertas.filter((a) => a.activa).length;

  const items = [
    ...consultas.map((c) => ({ date: c.fecha, label: `Consulta: ${c.motivoConsulta}`, badge: 'Consulta', tone: 'badge-primary' })),
    ...recetas.map((r) => ({ date: r.fecha, label: `Receta ${r.folio}`, badge: 'Prescripción', tone: 'badge-accent' })),
    ...documentos.map((d) => ({ date: d.fecha, label: d.nombre, badge: 'Documento', tone: 'badge-info' }))
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  panelEl.innerHTML = `
    <div class="card-grid">
      ${metricCardHtml({ label: 'Última consulta', value: consultas[0] ? formatDate(consultas[0].fecha) : '—', icon: icon('stethoscope'), tone: 'primary' })}
      ${metricCardHtml({ label: 'Próxima cita', value: proxima ? formatDate(proxima.fecha) : 'Sin citas', icon: icon('calendar'), tone: 'accent' })}
      ${metricCardHtml({ label: 'Alertas activas', value: alertasActivas, icon: icon('alert-triangle'), tone: 'warning' })}
      ${metricCardHtml({ label: 'Recetas emitidas', value: recetas.length, icon: icon('pill'), tone: 'success' })}
    </div>
    <div class="card">
      <div class="card-header"><h2>Accesos rápidos</h2></div>
      <div class="view-actions">
        <a class="btn btn-secondary btn-sm" href="#/consulta/${paciente.id}">${icon('stethoscope', { size: 14 })} Nueva consulta</a>
        <a class="btn btn-secondary btn-sm" href="#/recetas?pacienteId=${paciente.id}&action=nueva">${icon('pill', { size: 14 })} Receta</a>
        <a class="btn btn-secondary btn-sm" href="#/documentos?pacienteId=${paciente.id}&action=subir">${icon('upload', { size: 14 })} Subir documento</a>
        <a class="btn btn-secondary btn-sm" href="#/agenda?pacienteId=${paciente.id}">${icon('calendar', { size: 14 })} Agendar cita</a>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Actividad reciente</h2></div>
      ${
        items.length
          ? `<div class="timeline">
              ${items
                .map(
                  (item) => `
                <div class="timeline-item">
                  <div class="text-tertiary" style="font-size:11px;">${formatDate(item.date, { withTime: true })}</div>
                  <div style="font-size:13px; font-weight:500;">${escapeHtml(item.label)}</div>
                  <span class="badge ${item.tone}" style="margin-top:4px;">${item.badge}</span>
                </div>`
                )
                .join('')}
            </div>`
          : '<div class="empty-state">Sin actividad registrada.</div>'
      }
    </div>
  `;
}
