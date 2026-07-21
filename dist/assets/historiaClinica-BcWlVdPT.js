import{e,j as g,s as b,q as v,i as x,c as y,k as $,f as r}from"./index-DOxX59Tn.js";import{c as f}from"./card-Bj6da6jR.js";function h({tabs:n,activeId:t,onChange:s,panelHtml:a}){const l=document.createElement("div");l.className="tabs-wrapper",i();function i(){const c=n.map(o=>`<button type="button" class="tab-btn${o.id===t?" is-active":""}" data-tab="${o.id}">${e(o.label)}</button>`).join("");l.innerHTML=`
      <div class="tabs" role="tablist">${c}</div>
      <div class="tab-panel">${a(t)}</div>
    `,l.querySelectorAll(".tab-btn").forEach(o=>{o.addEventListener("click",()=>{o.dataset.tab!==t&&(t=o.dataset.tab,s&&s(t),i())})})}return{el:l,setActive(c){t=c,i()}}}let m=[];async function T(n,t={}){const s=g("pacientes",t.id);if(!s){n.innerHTML='<div class="empty-state">Paciente no encontrado.</div>';return}b("Historia Clínica","Registro clínico completo y longitudinal del paciente");const a=v("consultas",d=>d.pacienteId===s.id).sort((d,p)=>new Date(p.fecha)-new Date(d.fecha)),l=v("estudios",d=>d.pacienteId===s.id).sort((d,p)=>new Date(p.fecha)-new Date(d.fecha)),i=a[0]||null;n.innerHTML=`
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Historia Clínica</h1>
          <p>Registro clínico completo y longitudinal del paciente</p>
        </div>
        <div class="view-actions">
          <a class="btn btn-primary" href="#/consulta/${s.id}">${x("stethoscope",{size:15})} Nueva consulta</a>
        </div>
      </div>

      <div class="card">
        <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
          <span class="avatar-initials" style="width:56px;height:56px;font-size:18px;">${y(s.nombre+" "+s.apellidos)}</span>
          <div style="flex:1; min-width:220px;">
            <h2 style="font-size:17px;">${e(s.nombre)} ${e(s.apellidos)}</h2>
            <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
              <span class="badge badge-primary">${$(s.fechaNacimiento)} años</span>
              <span class="badge">${e(s.sexo)}</span>
              <span class="badge badge-accent">Grupo ${e(s.grupoSanguineo)}</span>
              ${s.alergias.length?`<span class="badge badge-danger">Alergia a ${e(s.alergias[0].sustancia)}</span>`:""}
              ${s.alertas.map(d=>`<span class="badge badge-warning">${e(d.tipo)}</span>`).join("")}
            </div>
          </div>
          <a class="btn btn-secondary btn-sm" href="#/pacientes/${s.id}">Ver ficha del paciente</a>
        </div>
      </div>

      <div class="two-col">
        <div id="historia-tabs-container"></div>
        <div class="stack">
          ${f({title:"Línea de tiempo de consultas",bodyHtml:a.length?`<div class="timeline">
                  ${a.map(d=>`
                    <div class="timeline-item">
                      <div class="text-tertiary" style="font-size:11px;">${r(d.fecha,{withTime:!0})}</div>
                      <div style="font-size:13px; font-weight:600;">${e(d.motivoConsulta)}</div>
                      <div class="text-tertiary" style="font-size:11.5px;">${e(u(d.medicoId))}</div>
                    </div>`).join("")}
                </div>`:'<div class="empty-state">Sin consultas registradas.</div>'})}
          ${i?f({title:`Signos vitales (${r(i.fecha,{withTime:!0})})`,bodyHtml:`
                    <div class="info-grid">
                      <div class="info-item"><div class="info-label">TA</div><div class="info-value">${e(i.signosVitales.ta)} mmHg</div></div>
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
  `;const c=document.getElementById("historia-tabs-container"),o=h({tabs:[{id:"resumen",label:"Resumen"},{id:"antecedentes",label:"Antecedentes"},{id:"evolucion",label:"Evolución"},{id:"exploracion",label:"Exploración Física"},{id:"diagnosticos",label:"Diagnósticos"},{id:"tratamiento",label:"Tratamiento"},{id:"alergias",label:"Alergias"},{id:"vacunas",label:"Vacunas"},{id:"estudios",label:"Estudios"}],activeId:"resumen",panelHtml:d=>z(d,s,a,i,l)});c.appendChild(w(o.el))}function w(n){const t=document.createElement("div");return t.className="card",t.appendChild(n),t}function u(n){const t=g("medicos",n);return t?t.nombre:""}function z(n,t,s,a,l){if(!a&&n!=="alergias"&&n!=="estudios"&&n!=="vacunas")return'<div class="empty-state">Aún no hay consultas registradas para este paciente.</div>';switch(n){case"resumen":return`
        <div class="card-grid">
          <div class="card"><h3 style="font-size:13px; margin-bottom:8px;">Antecedentes heredofamiliares</h3><p style="font-size:13px;">${e(a.antecedentes.heredofamiliares||"Sin información")}</p></div>
          <div class="card"><h3 style="font-size:13px; margin-bottom:8px;">Antecedentes personales patológicos</h3><p style="font-size:13px;">${e(a.antecedentes.personalesPatologicos||"Sin información")}</p></div>
          <div class="card"><h3 style="font-size:13px; margin-bottom:8px;">Padecimiento actual</h3><p style="font-size:13px;">${e(a.padecimientoActual)}</p></div>
          <div class="card">
            <h3 style="font-size:13px; margin-bottom:8px;">Síntomas</h3>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">${a.sintomas.map(i=>`<span class="badge badge-info">${e(i)}</span>`).join("")||'<span class="text-tertiary">Sin síntomas registrados</span>'}</div>
          </div>
          <div class="card"><h3 style="font-size:13px; margin-bottom:8px;">Exploración física</h3><p style="font-size:13px;">${e(a.exploracionFisica)}</p></div>
          <div class="card">
            <h3 style="font-size:13px; margin-bottom:8px;">Diagnóstico (CIE-10)</h3>
            <div class="stack" style="gap:6px;">${a.diagnosticos.map(i=>`<div><span class="badge badge-primary">${e(i.cie10)}</span> ${e(i.descripcion)}</div>`).join("")||'<span class="text-tertiary">Sin diagnóstico registrado</span>'}</div>
          </div>
          <div class="card">
            <h3 style="font-size:13px; margin-bottom:8px;">Plan terapéutico</h3>
            <ul style="padding-left:18px; font-size:13px; display:flex; flex-direction:column; gap:4px;">${a.planTerapeutico.map(i=>`<li>${e(i)}</li>`).join("")}</ul>
          </div>
          <div class="card"><h3 style="font-size:13px; margin-bottom:8px;">Notas</h3><p style="font-size:13px;">${e(a.notas||"Sin notas adicionales.")}</p></div>
        </div>
      `;case"antecedentes":return`
        <div class="stack">
          <div class="info-item"><div class="info-label">Heredofamiliares</div><div class="info-value">${e(a.antecedentes.heredofamiliares||"Sin información")}</div></div>
          <div class="info-item"><div class="info-label">Personales patológicos</div><div class="info-value">${e(a.antecedentes.personalesPatologicos||"Sin información")}</div></div>
          <div class="info-item"><div class="info-label">Personales no patológicos</div><div class="info-value">${e(a.antecedentes.personalesNoPatologicos||"Sin información")}</div></div>
        </div>
      `;case"evolucion":return s.length?`<div class="timeline">
            ${s.map(i=>`
              <div class="timeline-item">
                <div class="text-tertiary" style="font-size:11px;">${r(i.fecha,{withTime:!0})} · ${e(u(i.medicoId))}</div>
                <div style="font-size:13px; font-weight:600;">${e(i.motivoConsulta)}</div>
                <p style="font-size:13px; margin-top:4px;">${e(i.padecimientoActual)}</p>
              </div>`).join("")}
          </div>`:'<div class="empty-state">Sin evolución registrada.</div>';case"exploracion":return`<p style="font-size:13px;">${e(a.exploracionFisica)}</p>`;case"diagnosticos":return`
        <div class="stack">
          ${s.flatMap(i=>i.diagnosticos.map(c=>({...c,fecha:i.fecha}))).map(i=>`
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-color);">
              <div><span class="badge badge-primary">${e(i.cie10)}</span> ${e(i.descripcion)}</div>
              <span class="text-tertiary" style="font-size:12px;">${r(i.fecha)}</span>
            </div>`).join("")||'<div class="empty-state">Sin diagnósticos registrados.</div>'}
        </div>
      `;case"tratamiento":return`<ul style="padding-left:18px; font-size:13px; display:flex; flex-direction:column; gap:6px;">${a.planTerapeutico.map(i=>`<li>${e(i)}</li>`).join("")||'<li class="text-tertiary">Sin plan terapéutico registrado</li>'}</ul>`;case"alergias":return t.alergias.length?`<div class="stack">
            ${t.alergias.map(i=>`
              <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-color);">
                <div style="font-size:13px; font-weight:600;">${e(i.sustancia)}</div>
                <div class="text-tertiary" style="font-size:12px;">Reacción: ${e(i.reaccion)}</div>
              </div>`).join("")}
          </div>`:'<div class="empty-state">Sin alergias registradas.</div>';case"vacunas":return'<div class="empty-state">Sin registros de vacunación cargados en esta demo.</div>';case"estudios":return l.length?`<div class="stack">
            ${l.map(i=>`
              <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border-color);">
                <div>
                  <div style="font-size:13px; font-weight:600;">${e(i.estudiosSolicitados.join(", "))}</div>
                  <div class="text-tertiary" style="font-size:11.5px;">${r(i.fecha)} · ${i.tipoEstudio==="laboratorio"?"Laboratorio":"Imagen"}</div>
                </div>
                <span class="badge ${i.estado==="completado"?"badge-success":i.estado==="en_proceso"?"badge-info":"badge-warning"}">${i.estado.replace("_"," ")}</span>
              </div>`).join("")}
          </div>`:'<div class="empty-state">Sin órdenes de estudios registradas.</div>';default:return""}}function H(){m.forEach(n=>n()),m=[]}export{T as mount,H as unmount};
