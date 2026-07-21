import{q as v,i as c,f as r,e as s,j as $,l as N,a as I,b as _,u as D,s as k,g as E,n as j,k as M,c as C,m as q}from"./index-DOxX59Tn.js";import{m as y,c as L}from"./card-Bj6da6jR.js";import{c as R}from"./sectionNav-BrP0OdVw.js";import{o as O}from"./modal-CJgasGep.js";import{t as f,s as h,a as V,v as w,g as S}from"./form-BIA96B2r.js";import{s as P}from"./toast-DAoH9M8M.js";function F(a,n){const t=v("consultas",l=>l.pacienteId===a.id).sort((l,u)=>new Date(u.fecha)-new Date(l.fecha)),e=v("recetas",l=>l.pacienteId===a.id),i=v("documentos",l=>l.pacienteId===a.id),d=v("citas",l=>l.pacienteId===a.id).sort((l,u)=>new Date(`${l.fecha}T${l.horaInicio||"00:00"}`)-new Date(`${u.fecha}T${u.horaInicio||"00:00"}`)),o=new Date,p=d.find(l=>new Date(`${l.fecha}T${l.horaInicio||"00:00"}`)>=o),g=a.alertas.filter(l=>l.activa).length,b=[...t.map(l=>({date:l.fecha,label:`Consulta: ${l.motivoConsulta}`,badge:"Consulta",tone:"badge-primary"})),...e.map(l=>({date:l.fecha,label:`Receta ${l.folio}`,badge:"Prescripción",tone:"badge-accent"})),...i.map(l=>({date:l.fecha,label:l.nombre,badge:"Documento",tone:"badge-info"}))].sort((l,u)=>new Date(u.date)-new Date(l.date)).slice(0,6);n.innerHTML=`
    <div class="card-grid">
      ${y({label:"Última consulta",value:t[0]?r(t[0].fecha):"—",icon:c("stethoscope"),tone:"primary"})}
      ${y({label:"Próxima cita",value:p?r(p.fecha):"Sin citas",icon:c("calendar"),tone:"accent"})}
      ${y({label:"Alertas activas",value:g,icon:c("alert-triangle"),tone:"warning"})}
      ${y({label:"Recetas emitidas",value:e.length,icon:c("pill"),tone:"success"})}
    </div>
    <div class="card">
      <div class="card-header"><h2>Accesos rápidos</h2></div>
      <div class="view-actions">
        <a class="btn btn-secondary btn-sm" href="#/consulta/${a.id}">${c("stethoscope",{size:14})} Nueva consulta</a>
        <a class="btn btn-secondary btn-sm" href="#/recetas?pacienteId=${a.id}&action=nueva">${c("pill",{size:14})} Receta</a>
        <a class="btn btn-secondary btn-sm" href="#/documentos?pacienteId=${a.id}&action=subir">${c("upload",{size:14})} Subir documento</a>
        <a class="btn btn-secondary btn-sm" href="#/agenda?pacienteId=${a.id}">${c("calendar",{size:14})} Agendar cita</a>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Actividad reciente</h2></div>
      ${b.length?`<div class="timeline">
              ${b.map(l=>`
                <div class="timeline-item">
                  <div class="text-tertiary" style="font-size:11px;">${r(l.date,{withTime:!0})}</div>
                  <div style="font-size:13px; font-weight:500;">${s(l.label)}</div>
                  <span class="badge ${l.tone}" style="margin-top:4px;">${l.badge}</span>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin actividad registrada.</div>'}
    </div>
  `}const B=Object.freeze(Object.defineProperty({__proto__:null,render:F},Symbol.toStringTag,{value:"Module"}));function G(a,n){n.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Datos demográficos</h2></div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Fecha de nacimiento</div><div class="info-value">${r(a.fechaNacimiento)}</div></div>
        <div class="info-item"><div class="info-label">Estado civil</div><div class="info-value">${s(a.estadoCivil)}</div></div>
        <div class="info-item"><div class="info-label">CURP</div><div class="info-value">${s(a.curp)}</div></div>
        <div class="info-item"><div class="info-label">NSS</div><div class="info-value">${s(a.nss)}</div></div>
        <div class="info-item"><div class="info-label">Sexo</div><div class="info-value">${s(a.sexo)}</div></div>
        <div class="info-item"><div class="info-label">Grupo sanguíneo</div><div class="info-value">${s(a.grupoSanguineo)}</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Contacto</h2></div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Email</div><div class="info-value">${s(a.contacto.email)}</div></div>
        <div class="info-item"><div class="info-label">Teléfono</div><div class="info-value">${s(a.contacto.telefono)}</div></div>
        <div class="info-item"><div class="info-label">Domicilio</div><div class="info-value">${s(a.contacto.direccion)}</div></div>
        <div class="info-item"><div class="info-label">Contacto de emergencia</div><div class="info-value">${s(a.contactoEmergencia.nombre)} (${s(a.contactoEmergencia.parentesco)})</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Seguro médico</h2></div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Aseguradora</div><div class="info-value">${s(a.aseguradora.compania)}</div></div>
        <div class="info-item"><div class="info-label">Póliza</div><div class="info-value">${s(a.aseguradora.poliza)}</div></div>
        <div class="info-item"><div class="info-label">Plan</div><div class="info-value">${s(a.aseguradora.plan)}</div></div>
        <div class="info-item"><div class="info-label">Vigencia</div><div class="info-value">${r(a.aseguradora.vigenciaInicio)} – ${r(a.aseguradora.vigenciaFin)}</div></div>
      </div>
    </div>
  `}const U=Object.freeze(Object.defineProperty({__proto__:null,render:G},Symbol.toStringTag,{value:"Module"}));function Y(a,n){const e=v("consultas",i=>i.pacienteId===a.id).sort((i,d)=>new Date(d.fecha)-new Date(i.fecha))[0];n.innerHTML=`
    <div class="card">
      <div class="card-header">
        <h2>Antecedentes</h2>
        <a class="btn btn-secondary btn-sm" href="#/historia-clinica/${a.id}">${c("history",{size:14})} Ver historia clínica completa</a>
      </div>
      ${e?`<div class="stack">
              <div class="info-item"><div class="info-label">Heredofamiliares</div><div class="info-value">${s(e.antecedentes.heredofamiliares||"Sin información")}</div></div>
              <div class="info-item"><div class="info-label">Personales patológicos</div><div class="info-value">${s(e.antecedentes.personalesPatologicos||"Sin información")}</div></div>
              <div class="info-item"><div class="info-label">Personales no patológicos</div><div class="info-value">${s(e.antecedentes.personalesNoPatologicos||"Sin información")}</div></div>
            </div>`:'<div class="empty-state">Aún no hay consultas registradas para este paciente.</div>'}
    </div>
  `}const J=Object.freeze(Object.defineProperty({__proto__:null,render:Y},Symbol.toStringTag,{value:"Module"}));function K(a){const n=$("medicos",a);return n?n.nombre:""}function Q(a,n){const t=v("consultas",e=>e.pacienteId===a.id).sort((e,i)=>new Date(i.fecha)-new Date(e.fecha));n.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Consultas (${t.length})</h2></div>
      ${t.length?`<div class="stack" id="consultas-list" style="gap:8px;">
              ${t.map((e,i)=>`
                <div class="consulta-item" data-idx="${i}" style="border:1px solid var(--border-color); border-radius:var(--radius-md); overflow:hidden;">
                  <button type="button" class="consulta-item-toggle" style="width:100%; display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 14px; background:var(--bg-surface); text-align:left;">
                    <span>
                      <span style="font-size:13px; font-weight:600;">${s(e.motivoConsulta)}</span>
                      <span class="text-tertiary" style="font-size:11.5px; display:block;">${r(e.fecha,{withTime:!0})} · ${s(K(e.medicoId))}</span>
                    </span>
                    ${c("chevron-down",{size:16,className:"icon consulta-chevron"})}
                  </button>
                  <div class="consulta-item-body" style="display:none; padding:0 14px 14px;">
                    <p style="font-size:13px; margin-bottom:8px;"><strong>Padecimiento actual:</strong> ${s(e.padecimientoActual||"Sin información")}</p>
                    <p style="font-size:13px; margin-bottom:8px;"><strong>Exploración física:</strong> ${s(e.exploracionFisica||"Sin información")}</p>
                    <div class="stack" style="gap:4px;">
                      ${(e.diagnosticos||[]).map(d=>`<div><span class="badge badge-primary">${s(d.cie10)}</span> ${s(d.descripcion)}</div>`).join("")||'<span class="text-tertiary" style="font-size:12px;">Sin diagnóstico registrado</span>'}
                    </div>
                  </div>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin consultas registradas.</div>'}
    </div>
  `,n.querySelectorAll(".consulta-item-toggle").forEach(e=>{e.addEventListener("click",()=>{const i=e.closest(".consulta-item"),d=i.querySelector(".consulta-item-body"),o=d.style.display!=="none";d.style.display=o?"none":"block",i.querySelector(".consulta-chevron").style.transform=o?"":"rotate(180deg)"})})}const W=Object.freeze(Object.defineProperty({__proto__:null,render:Q},Symbol.toStringTag,{value:"Module"}));function X(a,n){const e=v("consultas",i=>i.pacienteId===a.id).flatMap(i=>i.diagnosticos.map(d=>({...d,fecha:i.fecha}))).sort((i,d)=>new Date(d.fecha)-new Date(i.fecha));n.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Diagnósticos (${e.length})</h2></div>
      <div class="stack" style="gap:0;">
        ${e.map(i=>`
          <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border-color);">
            <div><span class="badge badge-primary">${s(i.cie10)}</span> ${s(i.descripcion)}</div>
            <span class="text-tertiary" style="font-size:12px;">${r(i.fecha)}</span>
          </div>`).join("")||'<div class="empty-state">Sin diagnósticos registrados.</div>'}
      </div>
    </div>
  `}const Z=Object.freeze(Object.defineProperty({__proto__:null,render:X},Symbol.toStringTag,{value:"Module"}));function ee(a,n){const t=v("consultas",e=>e.pacienteId===a.id).sort((e,i)=>new Date(i.fecha)-new Date(e.fecha));n.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Planes terapéuticos</h2></div>
      ${t.length?`<div class="stack">
              ${t.map(e=>`
                <div style="border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                  <div style="font-size:12px; color:var(--text-tertiary); margin-bottom:4px;">${r(e.fecha)} · ${s(e.motivoConsulta)}</div>
                  <ul style="padding-left:18px; font-size:13px; display:flex; flex-direction:column; gap:4px;">
                    ${(e.planTerapeutico||[]).map(i=>`<li>${s(i)}</li>`).join("")||'<li class="text-tertiary">Sin plan terapéutico registrado</li>'}
                  </ul>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin tratamientos registrados.</div>'}
    </div>
  `}const ae=Object.freeze(Object.defineProperty({__proto__:null,render:ee},Symbol.toStringTag,{value:"Module"}));function ie(a,n){const t=v("recetas",e=>e.pacienteId===a.id).sort((e,i)=>new Date(i.fecha)-new Date(e.fecha));n.innerHTML=`
    <div class="card">
      <div class="card-header">
        <h2>Medicamentos prescritos</h2>
        <a class="btn btn-secondary btn-sm" href="#/recetas?pacienteId=${a.id}">${c("pill",{size:14})} Ver todas las recetas</a>
      </div>
      ${t.length?`<div class="stack">
              ${t.map(e=>`
                <div style="border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <strong style="font-size:13px;">Receta ${s(e.folio)}</strong>
                    <span class="text-tertiary" style="font-size:12px;">${r(e.fecha)}</span>
                  </div>
                  <div class="stack" style="gap:4px;">
                    ${e.medicamentos.map(i=>`<div style="font-size:13px;">${s(i.nombre)} ${s(i.concentracion)} — <span class="text-tertiary">${s(i.dosis)}, ${s(i.frecuencia)}</span></div>`).join("")}
                  </div>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin medicamentos prescritos.</div>'}
    </div>
  `}const te=Object.freeze(Object.defineProperty({__proto__:null,render:ie},Symbol.toStringTag,{value:"Module"}));function se(a,n){n.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Alergias y reacciones (${a.alergias.length})</h2></div>
      ${a.alergias.length?`<div class="stack" style="gap:0;">
              ${a.alergias.map(t=>`
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-color);">
                  <span class="badge badge-danger">${s(t.sustancia)}</span>
                  <span class="text-tertiary" style="font-size:12px;">Reacción: ${s(t.reaccion)}</span>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin alergias registradas.</div>'}
    </div>
    <div class="card">
      <div class="card-header"><h2>Alertas clínicas (${a.alertas.length})</h2></div>
      ${a.alertas.length?`<div class="stack" style="gap:0;">
              ${a.alertas.map(t=>`
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-color);">
                  <div>
                    <div style="font-size:13px; font-weight:600;">${s(t.tipo)}</div>
                    <div class="text-tertiary" style="font-size:12px;">${s(t.descripcion)}</div>
                  </div>
                  <span class="badge ${t.activa?"badge-warning":""}">${t.activa?"Activa":"Resuelta"}</span>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin alertas clínicas activas.</div>'}
    </div>
  `}const ne=Object.freeze(Object.defineProperty({__proto__:null,render:se},Symbol.toStringTag,{value:"Module"}));function oe(a,n){const t=v("consultas",d=>d.pacienteId===a.id).sort((d,o)=>new Date(d.fecha)-new Date(o.fecha)),e=t[t.length-1],i=t.filter(d=>{var o;return(o=d.signosVitales)==null?void 0:o.peso}).map(d=>({label:r(d.fecha),value:Number(d.signosVitales.peso)}));n.innerHTML=`
    ${e?`<div class="card">
            <div class="card-header"><h2>Últimos signos vitales (${r(e.fecha,{withTime:!0})})</h2></div>
            <div class="info-grid">
              <div class="info-item"><div class="info-label">TA</div><div class="info-value">${e.signosVitales.ta} mmHg</div></div>
              <div class="info-item"><div class="info-label">FC</div><div class="info-value">${e.signosVitales.fc} lpm</div></div>
              <div class="info-item"><div class="info-label">FR</div><div class="info-value">${e.signosVitales.fr} rpm</div></div>
              <div class="info-item"><div class="info-label">Temp.</div><div class="info-value">${e.signosVitales.temp} °C</div></div>
              <div class="info-item"><div class="info-label">SpO₂</div><div class="info-value">${e.signosVitales.spo2} %</div></div>
              <div class="info-item"><div class="info-label">Peso</div><div class="info-value">${e.signosVitales.peso} kg</div></div>
              <div class="info-item"><div class="info-label">Talla</div><div class="info-value">${e.signosVitales.talla} cm</div></div>
              <div class="info-item"><div class="info-label">IMC</div><div class="info-value">${e.signosVitales.imc} kg/m²</div></div>
            </div>
          </div>`:'<div class="empty-state">Sin signos vitales registrados.</div>'}
    ${i.length>1?`<div class="card">
            <div class="card-header"><h2>Tendencia de peso</h2></div>
            ${N({points:i,color:"var(--color-accent)"})}
          </div>`:""}
  `}const de=Object.freeze(Object.defineProperty({__proto__:null,render:oe},Symbol.toStringTag,{value:"Module"}));function le(a,n){const t=v("estudios",e=>e.pacienteId===a.id&&e.tipoEstudio==="laboratorio").sort((e,i)=>new Date(i.fecha)-new Date(e.fecha));n.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Estudios de laboratorio (${t.length})</h2></div>
      ${t.length?`<div class="stack" style="gap:0;">
              ${t.map(e=>`
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-color);">
                  <div>
                    <div style="font-size:13px; font-weight:600;">${s(e.estudiosSolicitados.join(", "))}</div>
                    <div class="text-tertiary" style="font-size:11.5px;">${r(e.fecha)} · Prioridad: ${s(e.prioridad)}</div>
                  </div>
                  <span class="badge ${I(e.estado)}">${_(e.estado)}</span>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin órdenes de laboratorio registradas.</div>'}
    </div>
  `}const ce=Object.freeze(Object.defineProperty({__proto__:null,render:le},Symbol.toStringTag,{value:"Module"}));function re(a,n){const t=v("documentos",e=>e.pacienteId===a.id&&e.tipo==="imagen").sort((e,i)=>new Date(i.fecha)-new Date(e.fecha));n.innerHTML=`
    <div class="card">
      <div class="card-header">
        <h2>Imágenes médicas (${t.length})</h2>
        <a class="btn btn-secondary btn-sm" href="#/documentos?pacienteId=${a.id}&tipo=imagen">${c("image",{size:14})} Abrir gestor de archivos</a>
      </div>
      ${t.length?`<div class="file-grid" style="max-height:none;">
              ${t.slice(0,8).map(e=>`
                <a class="file-card" href="#/documentos?pacienteId=${a.id}&tipo=imagen">
                  <div class="file-card-thumb">${e.blob?`<img src="${URL.createObjectURL(e.blob)}" alt="" />`:c("image",{size:28})}</div>
                  <div class="file-card-name">${s(e.nombre)}</div>
                  <div class="file-card-meta"><span>${s(e.categoria||"")}</span><span>${r(e.fecha)}</span></div>
                </a>`).join("")}
            </div>`:'<div class="empty-state">Sin imágenes médicas registradas.</div>'}
    </div>
  `}const ve=Object.freeze(Object.defineProperty({__proto__:null,render:re},Symbol.toStringTag,{value:"Module"})),pe={documento:"file-text",nota:"note"};function me(a,n){const t=v("documentos",e=>e.pacienteId===a.id&&e.tipo!=="imagen").sort((e,i)=>new Date(i.fecha)-new Date(e.fecha));n.innerHTML=`
    <div class="card">
      <div class="card-header">
        <h2>Documentos (${t.length})</h2>
        <a class="btn btn-secondary btn-sm" href="#/documentos?pacienteId=${a.id}&tipo=documento">${c("documents",{size:14})} Abrir gestor de archivos</a>
      </div>
      ${t.length?`<div class="stack" style="gap:0;">
              ${t.map(e=>`
                <a href="#/documentos?pacienteId=${a.id}" class="file-list-row" style="padding:10px 0; border-bottom:1px solid var(--border-color); color:inherit;">
                  <span class="file-type-icon">${c(pe[e.tipo]||"file",{size:18})}</span>
                  <div style="min-width:0; flex:1;">
                    <div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s(e.nombre)}</div>
                    <div class="text-tertiary" style="font-size:11.5px;">${s(e.categoria||"")} · ${r(e.fecha)}</div>
                  </div>
                </a>`).join("")}
            </div>`:'<div class="empty-state">Sin documentos registrados.</div>'}
    </div>
  `}const fe=Object.freeze(Object.defineProperty({__proto__:null,render:me},Symbol.toStringTag,{value:"Module"}));function ue(a,n){const t=v("citas",e=>e.pacienteId===a.id).sort((e,i)=>new Date(`${i.fecha}T${i.horaInicio||"00:00"}`)-new Date(`${e.fecha}T${e.horaInicio||"00:00"}`));n.innerHTML=`
    <div class="card">
      <div class="card-header">
        <h2>Citas (${t.length})</h2>
        <a class="btn btn-secondary btn-sm" href="#/agenda?pacienteId=${a.id}">${c("calendar",{size:14})} Abrir agenda</a>
      </div>
      ${t.length?`<div class="stack" style="gap:0;">
              ${t.map(e=>`
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-color);">
                  <div>
                    <div style="font-size:13px; font-weight:600;">${s(e.motivo)}</div>
                    <div class="text-tertiary" style="font-size:11.5px;">${r(e.fecha)} · ${s(e.horaInicio)}–${s(e.horaFin)}</div>
                  </div>
                  <span class="badge ${I(e.estado)}">${_(e.estado)}</span>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin citas registradas.</div>'}
    </div>
  `}const be=Object.freeze(Object.defineProperty({__proto__:null,render:ue},Symbol.toStringTag,{value:"Module"}));function ge(a,n,t={}){const e=[...a.referencias||[]].sort((i,d)=>new Date(d.fecha)-new Date(i.fecha));n.innerHTML=`
    <div class="card">
      <div class="card-header">
        <h2>Referencias / Interconsultas (${e.length})</h2>
        <button type="button" class="btn btn-primary btn-sm" id="btn-nueva-referencia">${c("plus",{size:14})} Nueva referencia</button>
      </div>
      ${e.length?`<div class="stack" style="gap:0;">
              ${e.map(i=>`
                <div style="padding:10px 0; border-bottom:1px solid var(--border-color);">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="font-size:13px;">${s(i.especialidad)} · ${s(i.medicoDestino)}</strong>
                    <span class="badge ${i.estado==="completada"?"badge-success":"badge-warning"}">${s(i.estado)}</span>
                  </div>
                  <div class="text-tertiary" style="font-size:11.5px; margin:4px 0;">${r(i.fecha)}</div>
                  <div style="font-size:13px;">${s(i.motivo)}</div>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin referencias registradas.</div>'}
    </div>
  `,n.querySelector("#btn-nueva-referencia").addEventListener("click",()=>he(a,t))}function he(a,n){const t=`
    <form id="form-nueva-referencia" class="form-grid">
      ${f({name:"especialidad",label:"Especialidad destino",required:!0})}
      ${f({name:"medicoDestino",label:"Médico / institución destino",required:!0})}
      ${f({name:"fecha",label:"Fecha",type:"date",required:!0,value:new Date().toISOString().slice(0,10)})}
      ${h({name:"estado",label:"Estado",options:[{value:"pendiente",label:"Pendiente"},{value:"completada",label:"Completada"}]})}
      ${V({name:"motivo",label:"Motivo de la referencia",span2:!0,rows:3,required:!0})}
    </form>
  `;O({title:"Nueva referencia",bodyHtml:t,footerHtml:`
      <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="modal-save">Guardar referencia</button>
    `,onMount:(e,i)=>{e.querySelector("#modal-cancel").addEventListener("click",i),e.querySelector("#modal-save").addEventListener("click",async()=>{const d=e.querySelector("#form-nueva-referencia");if(!w(d))return;const o=S(d),p=[...a.referencias||[],{...o}];await D("pacientes",a.id,{referencias:p}),i(),P({message:"Referencia guardada.",tone:"success"}),typeof n.refresh=="function"&&n.refresh()})}})}const ye=Object.freeze(Object.defineProperty({__proto__:null,render:ge},Symbol.toStringTag,{value:"Module"}));function $e(a,n,t={}){n.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Editar datos del paciente</h2></div>
      <form id="form-config-paciente" class="form-grid">
        ${f({name:"nombre",label:"Nombre(s)",value:a.nombre,required:!0})}
        ${f({name:"apellidos",label:"Apellidos",value:a.apellidos,required:!0})}
        ${f({name:"email",label:"Email",type:"email",value:a.contacto.email})}
        ${f({name:"telefono",label:"Teléfono",value:a.contacto.telefono,required:!0})}
        ${f({name:"direccion",label:"Domicilio",value:a.contacto.direccion,span2:!0})}
        ${h({name:"estado",label:"Estado del expediente",value:a.estado,options:[{value:"activo",label:"Activo"},{value:"inactivo",label:"Inactivo"}]})}
      </form>
      <div class="form-actions">
        <button type="button" class="btn btn-primary" id="btn-guardar-config">${c("save",{size:14})} Guardar cambios</button>
      </div>
    </div>
  `,n.querySelector("#btn-guardar-config").addEventListener("click",async()=>{const e=n.querySelector("#form-config-paciente");if(!w(e))return;const i=S(e);await D("pacientes",a.id,{nombre:i.nombre,apellidos:i.apellidos,estado:i.estado,contacto:{...a.contacto,email:i.email,telefono:i.telefono,direccion:i.direccion}}),P({message:"Datos del paciente actualizados.",tone:"success"}),typeof t.refresh=="function"&&t.refresh()})}const xe=Object.freeze(Object.defineProperty({__proto__:null,render:$e},Symbol.toStringTag,{value:"Module"})),z=[{id:"dashboard",label:"Dashboard del paciente",icon:"dashboard",mod:B},{id:"datosGenerales",label:"Datos generales",icon:"id-card",mod:U},{id:"historialClinico",label:"Historial clínico",icon:"history",mod:J},{id:"consultas",label:"Consultas",icon:"clipboard-list",mod:W},{id:"diagnosticos",label:"Diagnósticos",icon:"stethoscope",mod:Z},{id:"tratamientos",label:"Tratamientos",icon:"syringe",mod:ae},{id:"medicamentos",label:"Medicamentos",icon:"pill",mod:te},{id:"alergias",label:"Alergias",icon:"droplet",mod:ne},{id:"signosVitales",label:"Signos vitales",icon:"activity",mod:de},{id:"laboratorios",label:"Laboratorios",icon:"flask",mod:ce},{id:"imagenesMedicas",label:"Imágenes médicas",icon:"image",mod:ve},{id:"documentos",label:"Documentos",icon:"documents",mod:fe},{id:"citas",label:"Citas",icon:"calendar",mod:be},{id:"referencias",label:"Referencias",icon:"link",mod:ye},{id:"configuracion",label:"Configuración",icon:"settings",mod:xe}];let x=[],m=null;async function Me(a,n={},t={}){var l;k("Pacientes","Consulta, gestiona y mantén la información clínica de tus pacientes");const e=E("pacientes"),i=t.q||"",d=i?e.filter(u=>`${u.nombre} ${u.apellidos} ${u.id}`.toLowerCase().includes(i.toLowerCase())):e,o=n.id||((l=d[0]||e[0])==null?void 0:l.id),p=o?$("pacientes",o):null;a.innerHTML=`
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Pacientes / Identificación del Paciente</h1>
          <p>Consulta, gestiona y mantén la información demográfica y clínica de tus pacientes.</p>
        </div>
        <div class="view-actions">
          <button type="button" class="btn btn-primary" id="btn-nuevo-paciente">${c("plus",{size:15})} Nuevo paciente</button>
        </div>
      </div>
      <div class="three-col" id="pacientes-layout"></div>
    </div>
  `,we(a,e,d,p,i);const g=document.getElementById("btn-nuevo-paciente"),b=()=>T();g.addEventListener("click",b),x.push(()=>g.removeEventListener("click",b)),t.action==="nuevo"&&T()}function we(a,n,t,e,i){const d=document.getElementById("pacientes-layout");d.innerHTML=`
    <div class="card">
      <div class="stack" style="gap:10px;">
        <div class="table-search">
          ${c("search",{size:16})}
          <input type="search" id="paciente-search" placeholder="Buscar pacientes…" value="${s(i)}" />
        </div>
        <div class="text-tertiary" style="font-size:11.5px;">${t.length} de ${n.length} pacientes</div>
        <div class="patient-directory" id="patient-directory"></div>
      </div>
    </div>
    <div id="patient-detail"></div>
    <div id="patient-timeline"></div>
  `,Se(t,e==null?void 0:e.id),H(e),A(e),document.getElementById("paciente-search").addEventListener("input",p=>{const g=p.target.value,b=e?`#/pacientes/${e.id}`:"#/pacientes";j(`${b}?q=${encodeURIComponent(g)}`)})}function Se(a,n){const t=document.getElementById("patient-directory");if(!a.length){t.innerHTML='<div class="empty-state">Sin resultados.</div>';return}t.innerHTML=a.map(e=>{const i=M(e.fechaNacimiento);return`
        <a class="patient-directory-item${e.id===n?" is-active":""}" href="#/pacientes/${e.id}">
          <span class="avatar-initials" style="width:36px;height:36px;">${C(e.nombre+" "+e.apellidos)}</span>
          <div style="min-width:0;">
            <div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s(e.nombre)} ${s(e.apellidos)}</div>
            <div class="text-tertiary" style="font-size:11.5px;">${i} años · ${s(e.id)}</div>
          </div>
        </a>
      `}).join("")}function H(a){const n=document.getElementById("patient-detail");if(m&&(m.destroy(),m=null),!a){n.innerHTML=L({bodyHtml:'<div class="empty-state">Selecciona un paciente del directorio.</div>'});return}const t=M(a.fechaNacimiento);n.innerHTML="";const e=document.createElement("div");e.className="card",e.innerHTML=`
    <div style="display:flex; gap:16px; align-items:flex-start; flex-wrap:wrap;">
      <span class="avatar-initials" style="width:64px;height:64px;font-size:20px;">${C(a.nombre+" "+a.apellidos)}</span>
      <div style="flex:1; min-width:200px;">
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <h2 style="font-size:18px;">${s(a.nombre)} ${s(a.apellidos)}</h2>
        </div>
        <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
          <span class="badge badge-primary">${t} años</span>
          <span class="badge">${s(a.sexo)}</span>
          <span class="badge badge-accent">Grupo ${s(a.grupoSanguineo)}</span>
          <span class="badge badge-success">${s(a.estado==="activo"?"Asegurado":"Inactivo")}</span>
        </div>
        <div class="text-tertiary" style="font-size:12px; margin-top:6px;">ID Paciente: ${s(a.id)}</div>
      </div>
      <div class="view-actions">
        <a class="btn btn-secondary btn-sm" href="#/historia-clinica/${a.id}">${c("history",{size:14})} Historia Clínica</a>
        <a class="btn btn-primary btn-sm" href="#/consulta/${a.id}">${c("stethoscope",{size:14})} Nueva consulta</a>
      </div>
    </div>
    <div class="view-actions" style="margin-top:14px;">
      <a class="btn btn-secondary btn-sm" href="#/recetas?pacienteId=${a.id}">${c("pill",{size:14})} Receta</a>
      <a class="btn btn-secondary btn-sm" href="#/documentos?pacienteId=${a.id}">${c("image",{size:14})} Documentos</a>
      <a class="btn btn-secondary btn-sm" href="#/agenda?pacienteId=${a.id}">${c("calendar",{size:14})} Agenda</a>
    </div>
  `,n.appendChild(e);const i=document.createElement("div");i.className="card",n.appendChild(i);const d={refresh(){const o=$("pacientes",a.id),p=m==null?void 0:m.getActive();H(o),p&&m&&m.setActive(p),A(o)}};m=R({items:z,activeId:"dashboard",ariaLabel:"Secciones del expediente del paciente",renderPanel:(o,p)=>{const g=z.find(l=>l.id===o),b=$("pacientes",a.id)||a;return g.mod.render(b,p,d)}}),i.appendChild(m.el)}function A(a){const n=document.getElementById("patient-timeline");if(!a){n.innerHTML="";return}const t=v("consultas",o=>o.pacienteId===a.id).map(o=>({date:o.fecha,label:`Consulta: ${o.motivoConsulta}`,badge:"Consulta",tone:"badge-primary"})),e=v("recetas",o=>o.pacienteId===a.id).map(o=>({date:o.fecha,label:`Receta ${o.folio}`,badge:"Prescripción",tone:"badge-accent"})),i=v("documentos",o=>o.pacienteId===a.id).map(o=>({date:o.fecha,label:o.nombre,badge:"Documento",tone:"badge-info"})),d=[...t,...e,...i].sort((o,p)=>new Date(p.date)-new Date(o.date)).slice(0,8);n.innerHTML=L({title:"Línea de tiempo",bodyHtml:d.length?`<div class="timeline">
          ${d.map(o=>`
            <div class="timeline-item">
              <div class="text-tertiary" style="font-size:11px;">${r(o.date,{withTime:!0})}</div>
              <div style="font-size:13px; font-weight:500;">${s(o.label)}</div>
              <span class="badge ${o.tone}" style="margin-top:4px;">${o.badge}</span>
            </div>
          `).join("")}
        </div>`:'<div class="empty-state">Sin actividad registrada.</div>'})}function T(){const a=`
    <form id="form-nuevo-paciente" class="form-grid">
      ${f({name:"nombre",label:"Nombre(s)",required:!0})}
      ${f({name:"apellidos",label:"Apellidos",required:!0})}
      ${f({name:"fechaNacimiento",label:"Fecha de nacimiento",type:"date",required:!0})}
      ${h({name:"sexo",label:"Sexo",options:["Masculino","Femenino"],required:!0})}
      ${h({name:"estadoCivil",label:"Estado civil",options:["Soltero(a)","Casado(a)","Divorciado(a)","Viudo(a)"]})}
      ${h({name:"grupoSanguineo",label:"Grupo sanguíneo",options:["O+","O-","A+","A-","B+","B-","AB+","AB-"]})}
      ${f({name:"email",label:"Email",type:"email"})}
      ${f({name:"telefono",label:"Teléfono",required:!0})}
    </form>
  `;O({title:"Nuevo paciente",bodyHtml:a,footerHtml:`
      <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="modal-save">Guardar paciente</button>
    `,onMount:(n,t)=>{n.querySelector("#modal-cancel").addEventListener("click",t),n.querySelector("#modal-save").addEventListener("click",async()=>{const e=n.querySelector("#form-nuevo-paciente");if(!w(e))return;const i=S(e),d=await q("pacientes",{nombre:i.nombre,apellidos:i.apellidos,fechaNacimiento:i.fechaNacimiento,sexo:i.sexo,estadoCivil:i.estadoCivil||"No especificado",grupoSanguineo:i.grupoSanguineo||"No especificado",curp:"No registrado",nss:"No registrado",foto:"",contacto:{email:i.email||"",telefono:i.telefono,telefonoAlt:"",direccion:"No registrado"},aseguradora:{compania:"Particular",poliza:"",vigenciaInicio:"",vigenciaFin:"",plan:""},contactoEmergencia:{nombre:"",parentesco:"",telefono:""},alergias:[],alertas:[],referencias:[],estado:"activo",fechaRegistro:new Date().toISOString().slice(0,10)});t(),j(`#/pacientes/${d.id}`)})}})}function Ce(){x.forEach(a=>a()),x=[],m&&(m.destroy(),m=null)}export{Me as mount,Ce as unmount};
