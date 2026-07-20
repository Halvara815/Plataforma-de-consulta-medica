import{h as m,s as u,q as p,i as y,e as s,j as b,f as o}from"./index-BbYPTjK5.js";import{c as v}from"./card-CijOLgPO.js";import{c as h}from"./tabs-Dmi9qgmk.js";let f=[];async function T(n,d={}){const e=m("pacientes",d.id);if(!e){n.innerHTML='<div class="empty-state">Paciente no encontrado.</div>';return}u("Historia Clínica","Registro clínico completo y longitudinal del paciente");const a=p("consultas",t=>t.pacienteId===e.id).sort((t,r)=>new Date(r.fecha)-new Date(t.fecha)),l=p("estudios",t=>t.pacienteId===e.id).sort((t,r)=>new Date(r.fecha)-new Date(t.fecha)),i=a[0]||null;n.innerHTML=`
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Historia Clínica</h1>
          <p>Registro clínico completo y longitudinal del paciente</p>
        </div>
        <div class="view-actions">
          <a class="btn btn-primary" href="#/consulta/${e.id}">🩺 Nueva consulta</a>
        </div>
      </div>

      <div class="card">
        <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
          <span class="avatar-initials" style="width:56px;height:56px;font-size:18px;">${y(e.nombre+" "+e.apellidos)}</span>
          <div style="flex:1; min-width:220px;">
            <h2 style="font-size:17px;">${s(e.nombre)} ${s(e.apellidos)}</h2>
            <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
              <span class="badge badge-primary">${b(e.fechaNacimiento)} años</span>
              <span class="badge">${s(e.sexo)}</span>
              <span class="badge badge-accent">Grupo ${s(e.grupoSanguineo)}</span>
              ${e.alergias.length?`<span class="badge badge-danger">Alergia a ${s(e.alergias[0].sustancia)}</span>`:""}
              ${e.alertas.map(t=>`<span class="badge badge-warning">${s(t.tipo)}</span>`).join("")}
            </div>
          </div>
          <a class="btn btn-secondary btn-sm" href="#/pacientes/${e.id}">Ver ficha del paciente</a>
        </div>
      </div>

      <div class="two-col">
        <div id="historia-tabs-container"></div>
        <div class="stack">
          ${v({title:"Línea de tiempo de consultas",bodyHtml:a.length?`<div class="timeline">
                  ${a.map(t=>`
                    <div class="timeline-item">
                      <div class="text-tertiary" style="font-size:11px;">${o(t.fecha,{withTime:!0})}</div>
                      <div style="font-size:13px; font-weight:600;">${s(t.motivoConsulta)}</div>
                      <div class="text-tertiary" style="font-size:11.5px;">${s(g(t.medicoId))}</div>
                    </div>`).join("")}
                </div>`:'<div class="empty-state">Sin consultas registradas.</div>'})}
          ${i?v({title:`Signos vitales (${o(i.fecha,{withTime:!0})})`,bodyHtml:`
                    <div class="info-grid">
                      <div class="info-item"><div class="info-label">TA</div><div class="info-value">${s(i.signosVitales.ta)} mmHg</div></div>
                      <div class="info-item"><div class="info-label">FC</div><div class="info-value">${i.signosVitales.fc} lpm</div></div>
                      <div class="info-item"><div class="info-label">FR</div><div class="info-value">${i.signosVitales.fr} rpm</div></div>
                      <div class="info-item"><div class="info-label">Temp.</div><div class="info-value">${i.signosVitales.temp} °C</div></div>
                      <div class="info-item"><div class="info-label">SpO₂</div><div class="info-value">${i.signosVitales.spo2} %</div></div>
                      <div class="info-item"><div class="info-label">Peso</div><div class="info-value">${i.signosVitales.peso} kg</div></div>
                      <div class="info-item"><div class="info-label">Talla</div><div class="info-value">${i.signosVitales.talla} cm</div></div>
                      <div class="info-item"><div class="info-label">IMC</div><div class="info-value">${i.signosVitales.imc} kg/m²</div></div>
                    </div>
                  `}):""}
        </div>
      </div>
    </div>
  `;const c=document.getElementById("historia-tabs-container"),x=h({tabs:[{id:"resumen",label:"Resumen"},{id:"antecedentes",label:"Antecedentes"},{id:"evolucion",label:"Evolución"},{id:"exploracion",label:"Exploración Física"},{id:"diagnosticos",label:"Diagnósticos"},{id:"tratamiento",label:"Tratamiento"},{id:"alergias",label:"Alergias"},{id:"vacunas",label:"Vacunas"},{id:"estudios",label:"Estudios"}],activeId:"resumen",panelHtml:t=>w(t,e,a,i,l)});c.appendChild($(x.el))}function $(n){const d=document.createElement("div");return d.className="card",d.appendChild(n),d}function g(n){const d=m("medicos",n);return d?d.nombre:""}function w(n,d,e,a,l){if(!a&&n!=="alergias"&&n!=="estudios"&&n!=="vacunas")return'<div class="empty-state">Aún no hay consultas registradas para este paciente.</div>';switch(n){case"resumen":return`
        <div class="card-grid">
          <div class="card"><h3 style="font-size:13px; margin-bottom:8px;">Antecedentes heredofamiliares</h3><p style="font-size:13px;">${s(a.antecedentes.heredofamiliares||"Sin información")}</p></div>
          <div class="card"><h3 style="font-size:13px; margin-bottom:8px;">Antecedentes personales patológicos</h3><p style="font-size:13px;">${s(a.antecedentes.personalesPatologicos||"Sin información")}</p></div>
          <div class="card"><h3 style="font-size:13px; margin-bottom:8px;">Padecimiento actual</h3><p style="font-size:13px;">${s(a.padecimientoActual)}</p></div>
          <div class="card">
            <h3 style="font-size:13px; margin-bottom:8px;">Síntomas</h3>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">${a.sintomas.map(i=>`<span class="badge badge-info">${s(i)}</span>`).join("")||'<span class="text-tertiary">Sin síntomas registrados</span>'}</div>
          </div>
          <div class="card"><h3 style="font-size:13px; margin-bottom:8px;">Exploración física</h3><p style="font-size:13px;">${s(a.exploracionFisica)}</p></div>
          <div class="card">
            <h3 style="font-size:13px; margin-bottom:8px;">Diagnóstico (CIE-10)</h3>
            <div class="stack" style="gap:6px;">${a.diagnosticos.map(i=>`<div><span class="badge badge-primary">${s(i.cie10)}</span> ${s(i.descripcion)}</div>`).join("")||'<span class="text-tertiary">Sin diagnóstico registrado</span>'}</div>
          </div>
          <div class="card">
            <h3 style="font-size:13px; margin-bottom:8px;">Plan terapéutico</h3>
            <ul style="padding-left:18px; font-size:13px; display:flex; flex-direction:column; gap:4px;">${a.planTerapeutico.map(i=>`<li>${s(i)}</li>`).join("")}</ul>
          </div>
          <div class="card"><h3 style="font-size:13px; margin-bottom:8px;">Notas</h3><p style="font-size:13px;">${s(a.notas||"Sin notas adicionales.")}</p></div>
        </div>
      `;case"antecedentes":return`
        <div class="stack">
          <div class="info-item"><div class="info-label">Heredofamiliares</div><div class="info-value">${s(a.antecedentes.heredofamiliares||"Sin información")}</div></div>
          <div class="info-item"><div class="info-label">Personales patológicos</div><div class="info-value">${s(a.antecedentes.personalesPatologicos||"Sin información")}</div></div>
          <div class="info-item"><div class="info-label">Personales no patológicos</div><div class="info-value">${s(a.antecedentes.personalesNoPatologicos||"Sin información")}</div></div>
        </div>
      `;case"evolucion":return e.length?`<div class="timeline">
            ${e.map(i=>`
              <div class="timeline-item">
                <div class="text-tertiary" style="font-size:11px;">${o(i.fecha,{withTime:!0})} · ${s(g(i.medicoId))}</div>
                <div style="font-size:13px; font-weight:600;">${s(i.motivoConsulta)}</div>
                <p style="font-size:13px; margin-top:4px;">${s(i.padecimientoActual)}</p>
              </div>`).join("")}
          </div>`:'<div class="empty-state">Sin evolución registrada.</div>';case"exploracion":return`<p style="font-size:13px;">${s(a.exploracionFisica)}</p>`;case"diagnosticos":return`
        <div class="stack">
          ${e.flatMap(i=>i.diagnosticos.map(c=>({...c,fecha:i.fecha}))).map(i=>`
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-color);">
              <div><span class="badge badge-primary">${s(i.cie10)}</span> ${s(i.descripcion)}</div>
              <span class="text-tertiary" style="font-size:12px;">${o(i.fecha)}</span>
            </div>`).join("")||'<div class="empty-state">Sin diagnósticos registrados.</div>'}
        </div>
      `;case"tratamiento":return`<ul style="padding-left:18px; font-size:13px; display:flex; flex-direction:column; gap:6px;">${a.planTerapeutico.map(i=>`<li>${s(i)}</li>`).join("")||'<li class="text-tertiary">Sin plan terapéutico registrado</li>'}</ul>`;case"alergias":return d.alergias.length?`<div class="stack">
            ${d.alergias.map(i=>`
              <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-color);">
                <div style="font-size:13px; font-weight:600;">${s(i.sustancia)}</div>
                <div class="text-tertiary" style="font-size:12px;">Reacción: ${s(i.reaccion)}</div>
              </div>`).join("")}
          </div>`:'<div class="empty-state">Sin alergias registradas.</div>';case"vacunas":return'<div class="empty-state">Sin registros de vacunación cargados en esta demo.</div>';case"estudios":return l.length?`<div class="stack">
            ${l.map(i=>`
              <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border-color);">
                <div>
                  <div style="font-size:13px; font-weight:600;">${s(i.estudiosSolicitados.join(", "))}</div>
                  <div class="text-tertiary" style="font-size:11.5px;">${o(i.fecha)} · ${i.tipoEstudio==="laboratorio"?"Laboratorio":"Imagen"}</div>
                </div>
                <span class="badge ${i.estado==="completado"?"badge-success":i.estado==="en_proceso"?"badge-info":"badge-warning"}">${i.estado.replace("_"," ")}</span>
              </div>`).join("")}
          </div>`:'<div class="empty-state">Sin órdenes de estudios registradas.</div>';default:return""}}function C(){f.forEach(n=>n()),f=[]}export{T as mount,C as unmount};
