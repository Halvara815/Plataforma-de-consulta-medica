import{q as v,i as c,f as r,e as t,j as $,l as N,a as I,b as _,u as D,s as E,g as k,n as j,k as M,c as C,m as q}from"./index-kGilWOpK.js";import{m as y,c as L}from"./card-DxPzD0eG.js";import{c as R}from"./sectionNav-CdciFC9g.js";import{o as O}from"./modal-C8_1gc2H.js";import{t as f,s as h,a as V,v as w,g as S}from"./form-ORHtGPKz.js";import{s as P}from"./toast-DAoH9M8M.js";function F(i,n){const s=v("consultas",l=>l.pacienteId===i.id).sort((l,u)=>new Date(u.fecha)-new Date(l.fecha)),e=v("recetas",l=>l.pacienteId===i.id),a=v("documentos",l=>l.pacienteId===i.id),d=v("citas",l=>l.pacienteId===i.id).sort((l,u)=>new Date(`${l.fecha}T${l.horaInicio||"00:00"}`)-new Date(`${u.fecha}T${u.horaInicio||"00:00"}`)),o=new Date,m=d.find(l=>new Date(`${l.fecha}T${l.horaInicio||"00:00"}`)>=o),g=i.alertas.filter(l=>l.activa).length,b=[...s.map(l=>({date:l.fecha,label:`Consulta: ${l.motivoConsulta}`,badge:"Consulta",tone:"badge-primary"})),...e.map(l=>({date:l.fecha,label:`Receta ${l.folio}`,badge:"Prescripción",tone:"badge-accent"})),...a.map(l=>({date:l.fecha,label:l.nombre,badge:"Documento",tone:"badge-info"}))].sort((l,u)=>new Date(u.date)-new Date(l.date)).slice(0,6);n.innerHTML=`
    <div class="card-grid">
      ${y({label:"Última consulta",value:s[0]?r(s[0].fecha):"—",icon:c("stethoscope"),tone:"primary"})}
      ${y({label:"Próxima cita",value:m?r(m.fecha):"Sin citas",icon:c("calendar"),tone:"accent"})}
      ${y({label:"Alertas activas",value:g,icon:c("alert-triangle"),tone:"warning"})}
      ${y({label:"Recetas emitidas",value:e.length,icon:c("pill"),tone:"success"})}
    </div>
    <div class="card">
      <div class="card-header"><h2>Accesos rápidos</h2></div>
      <div class="view-actions">
        <a class="btn btn-secondary btn-sm" href="#/consulta/${i.id}">${c("stethoscope",{size:14})} Nueva consulta</a>
        <a class="btn btn-secondary btn-sm" href="#/recetas?pacienteId=${i.id}&action=nueva">${c("pill",{size:14})} Receta</a>
        <a class="btn btn-secondary btn-sm" href="#/documentos?pacienteId=${i.id}&action=subir">${c("upload",{size:14})} Subir documento</a>
        <a class="btn btn-secondary btn-sm" href="#/agenda?pacienteId=${i.id}">${c("calendar",{size:14})} Agendar cita</a>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Actividad reciente</h2></div>
      ${b.length?`<div class="timeline">
              ${b.map(l=>`
                <div class="timeline-item">
                  <div class="text-tertiary" style="font-size:11px;">${r(l.date,{withTime:!0})}</div>
                  <div style="font-size:13px; font-weight:500;">${t(l.label)}</div>
                  <span class="badge ${l.tone}" style="margin-top:4px;">${l.badge}</span>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin actividad registrada.</div>'}
    </div>
  `}const B=Object.freeze(Object.defineProperty({__proto__:null,render:F},Symbol.toStringTag,{value:"Module"}));function G(i,n){n.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Datos demográficos</h2></div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Fecha de nacimiento</div><div class="info-value">${r(i.fechaNacimiento)}</div></div>
        <div class="info-item"><div class="info-label">Estado civil</div><div class="info-value">${t(i.estadoCivil)}</div></div>
        <div class="info-item"><div class="info-label">CURP</div><div class="info-value">${t(i.curp)}</div></div>
        <div class="info-item"><div class="info-label">NSS</div><div class="info-value">${t(i.nss)}</div></div>
        <div class="info-item"><div class="info-label">Sexo</div><div class="info-value">${t(i.sexo)}</div></div>
        <div class="info-item"><div class="info-label">Grupo sanguíneo</div><div class="info-value">${t(i.grupoSanguineo)}</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Contacto</h2></div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Email</div><div class="info-value">${t(i.contacto.email)}</div></div>
        <div class="info-item"><div class="info-label">Teléfono</div><div class="info-value">${t(i.contacto.telefono)}</div></div>
        <div class="info-item"><div class="info-label">Domicilio</div><div class="info-value">${t(i.contacto.direccion)}</div></div>
        <div class="info-item"><div class="info-label">Contacto de emergencia</div><div class="info-value">${t(i.contactoEmergencia.nombre)} (${t(i.contactoEmergencia.parentesco)})</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Seguro médico</h2></div>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Aseguradora</div><div class="info-value">${t(i.aseguradora.compania)}</div></div>
        <div class="info-item"><div class="info-label">Póliza</div><div class="info-value">${t(i.aseguradora.poliza)}</div></div>
        <div class="info-item"><div class="info-label">Plan</div><div class="info-value">${t(i.aseguradora.plan)}</div></div>
        <div class="info-item"><div class="info-label">Vigencia</div><div class="info-value">${r(i.aseguradora.vigenciaInicio)} – ${r(i.aseguradora.vigenciaFin)}</div></div>
      </div>
    </div>
  `}const U=Object.freeze(Object.defineProperty({__proto__:null,render:G},Symbol.toStringTag,{value:"Module"}));function Y(i,n){const e=v("consultas",a=>a.pacienteId===i.id).sort((a,d)=>new Date(d.fecha)-new Date(a.fecha))[0];n.innerHTML=`
    <div class="card">
      <div class="card-header">
        <h2>Antecedentes</h2>
        <a class="btn btn-secondary btn-sm" href="#/historia-clinica/${i.id}">${c("history",{size:14})} Ver historia clínica completa</a>
      </div>
      ${e?`<div class="stack">
              <div class="info-item"><div class="info-label">Heredofamiliares</div><div class="info-value">${t(e.antecedentes.heredofamiliares||"Sin información")}</div></div>
              <div class="info-item"><div class="info-label">Personales patológicos</div><div class="info-value">${t(e.antecedentes.personalesPatologicos||"Sin información")}</div></div>
              <div class="info-item"><div class="info-label">Personales no patológicos</div><div class="info-value">${t(e.antecedentes.personalesNoPatologicos||"Sin información")}</div></div>
            </div>`:'<div class="empty-state">Aún no hay consultas registradas para este paciente.</div>'}
    </div>
  `}const J=Object.freeze(Object.defineProperty({__proto__:null,render:Y},Symbol.toStringTag,{value:"Module"}));function K(i){const n=$("medicos",i);return n?n.nombre:""}function Q(i,n){const s=v("consultas",e=>e.pacienteId===i.id).sort((e,a)=>new Date(a.fecha)-new Date(e.fecha));n.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Consultas (${s.length})</h2></div>
      ${s.length?`<div class="consulta-list">
              ${s.map((e,a)=>`
                <div class="consulta-item" data-idx="${a}">
                  <button type="button" class="consulta-item-toggle">
                    <span class="consulta-item-icon">${c("stethoscope",{size:17})}</span>
                    <span class="consulta-item-main">
                      <span class="consulta-item-title">${t(e.motivoConsulta)}</span>
                      <span class="consulta-item-meta">${r(e.fecha,{withTime:!0})} · ${t(K(e.medicoId))}</span>
                    </span>
                    ${c("chevron-down",{size:16,className:"icon consulta-item-chevron"})}
                  </button>
                  <div class="consulta-item-body" style="display:none;">
                    <div class="info-item">
                      <div class="info-label">Padecimiento actual</div>
                      <div class="info-value">${t(e.padecimientoActual||"Sin información")}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Exploración física</div>
                      <div class="info-value">${t(e.exploracionFisica||"Sin información")}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">Diagnóstico</div>
                      <div class="stack" style="gap:6px; margin-top:4px;">
                        ${(e.diagnosticos||[]).map(d=>`<div><span class="badge badge-primary">${t(d.cie10)}</span> ${t(d.descripcion)}</div>`).join("")||'<span class="text-tertiary" style="font-size:12px;">Sin diagnóstico registrado</span>'}
                      </div>
                    </div>
                  </div>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin consultas registradas.</div>'}
    </div>
  `,n.querySelectorAll(".consulta-item-toggle").forEach(e=>{e.addEventListener("click",()=>{const a=e.closest(".consulta-item"),d=a.querySelector(".consulta-item-body"),o=a.classList.toggle("is-open");d.style.display=o?"block":"none"})})}const W=Object.freeze(Object.defineProperty({__proto__:null,render:Q},Symbol.toStringTag,{value:"Module"}));function X(i,n){const e=v("consultas",a=>a.pacienteId===i.id).flatMap(a=>a.diagnosticos.map(d=>({...d,fecha:a.fecha}))).sort((a,d)=>new Date(d.fecha)-new Date(a.fecha));n.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Diagnósticos (${e.length})</h2></div>
      <div class="stack" style="gap:0;">
        ${e.map(a=>`
          <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border-color);">
            <div><span class="badge badge-primary">${t(a.cie10)}</span> ${t(a.descripcion)}</div>
            <span class="text-tertiary" style="font-size:12px;">${r(a.fecha)}</span>
          </div>`).join("")||'<div class="empty-state">Sin diagnósticos registrados.</div>'}
      </div>
    </div>
  `}const Z=Object.freeze(Object.defineProperty({__proto__:null,render:X},Symbol.toStringTag,{value:"Module"}));function ee(i,n){const s=v("consultas",e=>e.pacienteId===i.id).sort((e,a)=>new Date(a.fecha)-new Date(e.fecha));n.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Planes terapéuticos</h2></div>
      ${s.length?`<div class="stack">
              ${s.map(e=>`
                <div style="border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                  <div style="font-size:12px; color:var(--text-tertiary); margin-bottom:4px;">${r(e.fecha)} · ${t(e.motivoConsulta)}</div>
                  <ul style="padding-left:18px; font-size:13px; display:flex; flex-direction:column; gap:4px;">
                    ${(e.planTerapeutico||[]).map(a=>`<li>${t(a)}</li>`).join("")||'<li class="text-tertiary">Sin plan terapéutico registrado</li>'}
                  </ul>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin tratamientos registrados.</div>'}
    </div>
  `}const ie=Object.freeze(Object.defineProperty({__proto__:null,render:ee},Symbol.toStringTag,{value:"Module"}));function ae(i,n){const s=v("recetas",e=>e.pacienteId===i.id).sort((e,a)=>new Date(a.fecha)-new Date(e.fecha));n.innerHTML=`
    <div class="card">
      <div class="card-header">
        <h2>Medicamentos prescritos</h2>
        <a class="btn btn-secondary btn-sm" href="#/recetas?pacienteId=${i.id}">${c("pill",{size:14})} Ver todas las recetas</a>
      </div>
      ${s.length?`<div class="stack">
              ${s.map(e=>`
                <div style="border-bottom:1px solid var(--border-color); padding-bottom:12px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <strong style="font-size:13px;">Receta ${t(e.folio)}</strong>
                    <span class="text-tertiary" style="font-size:12px;">${r(e.fecha)}</span>
                  </div>
                  <div class="stack" style="gap:4px;">
                    ${e.medicamentos.map(a=>`<div style="font-size:13px;">${t(a.nombre)} ${t(a.concentracion)} — <span class="text-tertiary">${t(a.dosis)}, ${t(a.frecuencia)}</span></div>`).join("")}
                  </div>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin medicamentos prescritos.</div>'}
    </div>
  `}const se=Object.freeze(Object.defineProperty({__proto__:null,render:ae},Symbol.toStringTag,{value:"Module"}));function te(i,n){n.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Alergias y reacciones (${i.alergias.length})</h2></div>
      ${i.alergias.length?`<div class="stack" style="gap:0;">
              ${i.alergias.map(s=>`
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-color);">
                  <span class="badge badge-danger">${t(s.sustancia)}</span>
                  <span class="text-tertiary" style="font-size:12px;">Reacción: ${t(s.reaccion)}</span>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin alergias registradas.</div>'}
    </div>
    <div class="card">
      <div class="card-header"><h2>Alertas clínicas (${i.alertas.length})</h2></div>
      ${i.alertas.length?`<div class="stack" style="gap:0;">
              ${i.alertas.map(s=>`
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-color);">
                  <div>
                    <div style="font-size:13px; font-weight:600;">${t(s.tipo)}</div>
                    <div class="text-tertiary" style="font-size:12px;">${t(s.descripcion)}</div>
                  </div>
                  <span class="badge ${s.activa?"badge-warning":""}">${s.activa?"Activa":"Resuelta"}</span>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin alertas clínicas activas.</div>'}
    </div>
  `}const ne=Object.freeze(Object.defineProperty({__proto__:null,render:te},Symbol.toStringTag,{value:"Module"}));function oe(i,n){const s=v("consultas",d=>d.pacienteId===i.id).sort((d,o)=>new Date(d.fecha)-new Date(o.fecha)),e=s[s.length-1],a=s.filter(d=>{var o;return(o=d.signosVitales)==null?void 0:o.peso}).map(d=>({label:r(d.fecha),value:Number(d.signosVitales.peso)}));n.innerHTML=`
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
    ${a.length>1?`<div class="card">
            <div class="card-header"><h2>Tendencia de peso</h2></div>
            ${N({points:a,color:"var(--color-accent)"})}
          </div>`:""}
  `}const de=Object.freeze(Object.defineProperty({__proto__:null,render:oe},Symbol.toStringTag,{value:"Module"}));function le(i,n){const s=v("estudios",e=>e.pacienteId===i.id&&e.tipoEstudio==="laboratorio").sort((e,a)=>new Date(a.fecha)-new Date(e.fecha));n.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Estudios de laboratorio (${s.length})</h2></div>
      ${s.length?`<div class="stack" style="gap:0;">
              ${s.map(e=>`
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-color);">
                  <div>
                    <div style="font-size:13px; font-weight:600;">${t(e.estudiosSolicitados.join(", "))}</div>
                    <div class="text-tertiary" style="font-size:11.5px;">${r(e.fecha)} · Prioridad: ${t(e.prioridad)}</div>
                  </div>
                  <span class="badge ${I(e.estado)}">${_(e.estado)}</span>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin órdenes de laboratorio registradas.</div>'}
    </div>
  `}const ce=Object.freeze(Object.defineProperty({__proto__:null,render:le},Symbol.toStringTag,{value:"Module"}));function re(i,n){const s=v("documentos",e=>e.pacienteId===i.id&&e.tipo==="imagen").sort((e,a)=>new Date(a.fecha)-new Date(e.fecha));n.innerHTML=`
    <div class="card">
      <div class="card-header">
        <h2>Imágenes médicas (${s.length})</h2>
        <a class="btn btn-secondary btn-sm" href="#/documentos?pacienteId=${i.id}&tipo=imagen">${c("image",{size:14})} Abrir gestor de archivos</a>
      </div>
      ${s.length?`<div class="file-grid" style="max-height:none;">
              ${s.slice(0,8).map(e=>`
                <a class="file-card" href="#/documentos?pacienteId=${i.id}&tipo=imagen">
                  <div class="file-card-thumb">${e.blob?`<img src="${URL.createObjectURL(e.blob)}" alt="" />`:c("image",{size:28})}</div>
                  <div class="file-card-name">${t(e.nombre)}</div>
                  <div class="file-card-meta"><span>${t(e.categoria||"")}</span><span>${r(e.fecha)}</span></div>
                </a>`).join("")}
            </div>`:'<div class="empty-state">Sin imágenes médicas registradas.</div>'}
    </div>
  `}const ve=Object.freeze(Object.defineProperty({__proto__:null,render:re},Symbol.toStringTag,{value:"Module"})),me={documento:"file-text",nota:"note"};function pe(i,n){const s=v("documentos",e=>e.pacienteId===i.id&&e.tipo!=="imagen").sort((e,a)=>new Date(a.fecha)-new Date(e.fecha));n.innerHTML=`
    <div class="card">
      <div class="card-header">
        <h2>Documentos (${s.length})</h2>
        <a class="btn btn-secondary btn-sm" href="#/documentos?pacienteId=${i.id}&tipo=documento">${c("documents",{size:14})} Abrir gestor de archivos</a>
      </div>
      ${s.length?`<div class="stack" style="gap:0;">
              ${s.map(e=>`
                <a href="#/documentos?pacienteId=${i.id}" class="file-list-row" style="padding:10px 0; border-bottom:1px solid var(--border-color); color:inherit;">
                  <span class="file-type-icon">${c(me[e.tipo]||"file",{size:18})}</span>
                  <div style="min-width:0; flex:1;">
                    <div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${t(e.nombre)}</div>
                    <div class="text-tertiary" style="font-size:11.5px;">${t(e.categoria||"")} · ${r(e.fecha)}</div>
                  </div>
                </a>`).join("")}
            </div>`:'<div class="empty-state">Sin documentos registrados.</div>'}
    </div>
  `}const fe=Object.freeze(Object.defineProperty({__proto__:null,render:pe},Symbol.toStringTag,{value:"Module"}));function ue(i,n){const s=v("citas",e=>e.pacienteId===i.id).sort((e,a)=>new Date(`${a.fecha}T${a.horaInicio||"00:00"}`)-new Date(`${e.fecha}T${e.horaInicio||"00:00"}`));n.innerHTML=`
    <div class="card">
      <div class="card-header">
        <h2>Citas (${s.length})</h2>
        <a class="btn btn-secondary btn-sm" href="#/agenda?pacienteId=${i.id}">${c("calendar",{size:14})} Abrir agenda</a>
      </div>
      ${s.length?`<div class="stack" style="gap:0;">
              ${s.map(e=>`
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--border-color);">
                  <div>
                    <div style="font-size:13px; font-weight:600;">${t(e.motivo)}</div>
                    <div class="text-tertiary" style="font-size:11.5px;">${r(e.fecha)} · ${t(e.horaInicio)}–${t(e.horaFin)}</div>
                  </div>
                  <span class="badge ${I(e.estado)}">${_(e.estado)}</span>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin citas registradas.</div>'}
    </div>
  `}const be=Object.freeze(Object.defineProperty({__proto__:null,render:ue},Symbol.toStringTag,{value:"Module"}));function ge(i,n,s={}){const e=[...i.referencias||[]].sort((a,d)=>new Date(d.fecha)-new Date(a.fecha));n.innerHTML=`
    <div class="card">
      <div class="card-header">
        <h2>Referencias / Interconsultas (${e.length})</h2>
        <button type="button" class="btn btn-primary btn-sm" id="btn-nueva-referencia">${c("plus",{size:14})} Nueva referencia</button>
      </div>
      ${e.length?`<div class="stack" style="gap:0;">
              ${e.map(a=>`
                <div style="padding:10px 0; border-bottom:1px solid var(--border-color);">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="font-size:13px;">${t(a.especialidad)} · ${t(a.medicoDestino)}</strong>
                    <span class="badge ${a.estado==="completada"?"badge-success":"badge-warning"}">${t(a.estado)}</span>
                  </div>
                  <div class="text-tertiary" style="font-size:11.5px; margin:4px 0;">${r(a.fecha)}</div>
                  <div style="font-size:13px;">${t(a.motivo)}</div>
                </div>`).join("")}
            </div>`:'<div class="empty-state">Sin referencias registradas.</div>'}
    </div>
  `,n.querySelector("#btn-nueva-referencia").addEventListener("click",()=>he(i,s))}function he(i,n){const s=`
    <form id="form-nueva-referencia" class="form-grid">
      ${f({name:"especialidad",label:"Especialidad destino",required:!0})}
      ${f({name:"medicoDestino",label:"Médico / institución destino",required:!0})}
      ${f({name:"fecha",label:"Fecha",type:"date",required:!0,value:new Date().toISOString().slice(0,10)})}
      ${h({name:"estado",label:"Estado",options:[{value:"pendiente",label:"Pendiente"},{value:"completada",label:"Completada"}]})}
      ${V({name:"motivo",label:"Motivo de la referencia",span2:!0,rows:3,required:!0})}
    </form>
  `;O({title:"Nueva referencia",bodyHtml:s,footerHtml:`
      <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="modal-save">Guardar referencia</button>
    `,onMount:(e,a)=>{e.querySelector("#modal-cancel").addEventListener("click",a),e.querySelector("#modal-save").addEventListener("click",async()=>{const d=e.querySelector("#form-nueva-referencia");if(!w(d))return;const o=S(d),m=[...i.referencias||[],{...o}];await D("pacientes",i.id,{referencias:m}),a(),P({message:"Referencia guardada.",tone:"success"}),typeof n.refresh=="function"&&n.refresh()})}})}const ye=Object.freeze(Object.defineProperty({__proto__:null,render:ge},Symbol.toStringTag,{value:"Module"}));function $e(i,n,s={}){n.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Editar datos del paciente</h2></div>
      <form id="form-config-paciente" class="form-grid">
        ${f({name:"nombre",label:"Nombre(s)",value:i.nombre,required:!0})}
        ${f({name:"apellidos",label:"Apellidos",value:i.apellidos,required:!0})}
        ${f({name:"email",label:"Email",type:"email",value:i.contacto.email})}
        ${f({name:"telefono",label:"Teléfono",value:i.contacto.telefono,required:!0})}
        ${f({name:"direccion",label:"Domicilio",value:i.contacto.direccion,span2:!0})}
        ${h({name:"estado",label:"Estado del expediente",value:i.estado,options:[{value:"activo",label:"Activo"},{value:"inactivo",label:"Inactivo"}]})}
      </form>
      <div class="form-actions">
        <button type="button" class="btn btn-primary" id="btn-guardar-config">${c("save",{size:14})} Guardar cambios</button>
      </div>
    </div>
  `,n.querySelector("#btn-guardar-config").addEventListener("click",async()=>{const e=n.querySelector("#form-config-paciente");if(!w(e))return;const a=S(e);await D("pacientes",i.id,{nombre:a.nombre,apellidos:a.apellidos,estado:a.estado,contacto:{...i.contacto,email:a.email,telefono:a.telefono,direccion:a.direccion}}),P({message:"Datos del paciente actualizados.",tone:"success"}),typeof s.refresh=="function"&&s.refresh()})}const xe=Object.freeze(Object.defineProperty({__proto__:null,render:$e},Symbol.toStringTag,{value:"Module"})),z=[{id:"dashboard",label:"Dashboard del paciente",icon:"dashboard",mod:B},{id:"datosGenerales",label:"Datos generales",icon:"id-card",mod:U},{id:"historialClinico",label:"Historial clínico",icon:"history",mod:J},{id:"consultas",label:"Consultas",icon:"clipboard-list",mod:W},{id:"diagnosticos",label:"Diagnósticos",icon:"stethoscope",mod:Z},{id:"tratamientos",label:"Tratamientos",icon:"syringe",mod:ie},{id:"medicamentos",label:"Medicamentos",icon:"pill",mod:se},{id:"alergias",label:"Alergias",icon:"droplet",mod:ne},{id:"signosVitales",label:"Signos vitales",icon:"activity",mod:de},{id:"laboratorios",label:"Laboratorios",icon:"flask",mod:ce},{id:"imagenesMedicas",label:"Imágenes médicas",icon:"image",mod:ve},{id:"documentos",label:"Documentos",icon:"documents",mod:fe},{id:"citas",label:"Citas",icon:"calendar",mod:be},{id:"referencias",label:"Referencias",icon:"link",mod:ye},{id:"configuracion",label:"Configuración",icon:"settings",mod:xe}];let x=[],p=null;async function Me(i,n={},s={}){var l;E("Pacientes","Consulta, gestiona y mantén la información clínica de tus pacientes");const e=k("pacientes"),a=s.q||"",d=a?e.filter(u=>`${u.nombre} ${u.apellidos} ${u.id}`.toLowerCase().includes(a.toLowerCase())):e,o=n.id||((l=d[0]||e[0])==null?void 0:l.id),m=o?$("pacientes",o):null;i.innerHTML=`
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
  `,we(i,e,d,m,a);const g=document.getElementById("btn-nuevo-paciente"),b=()=>T();g.addEventListener("click",b),x.push(()=>g.removeEventListener("click",b)),s.action==="nuevo"&&T()}function we(i,n,s,e,a){const d=document.getElementById("pacientes-layout");d.innerHTML=`
    <div class="card">
      <div class="stack" style="gap:10px;">
        <div class="table-search">
          ${c("search",{size:16})}
          <input type="search" id="paciente-search" placeholder="Buscar pacientes…" value="${t(a)}" />
        </div>
        <div class="text-tertiary" style="font-size:11.5px;">${s.length} de ${n.length} pacientes</div>
        <div class="patient-directory" id="patient-directory"></div>
      </div>
    </div>
    <div id="patient-detail"></div>
    <div id="patient-timeline"></div>
  `,Se(s,e==null?void 0:e.id),H(e),A(e),document.getElementById("paciente-search").addEventListener("input",m=>{const g=m.target.value,b=e?`#/pacientes/${e.id}`:"#/pacientes";j(`${b}?q=${encodeURIComponent(g)}`)})}function Se(i,n){const s=document.getElementById("patient-directory");if(!i.length){s.innerHTML='<div class="empty-state">Sin resultados.</div>';return}s.innerHTML=i.map(e=>{const a=M(e.fechaNacimiento);return`
        <a class="patient-directory-item${e.id===n?" is-active":""}" href="#/pacientes/${e.id}">
          <span class="avatar-initials" style="width:36px;height:36px;">${C(e.nombre+" "+e.apellidos)}</span>
          <div style="min-width:0;">
            <div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${t(e.nombre)} ${t(e.apellidos)}</div>
            <div class="text-tertiary" style="font-size:11.5px;">${a} años · ${t(e.id)}</div>
          </div>
        </a>
      `}).join("")}function H(i){const n=document.getElementById("patient-detail");if(p&&(p.destroy(),p=null),!i){n.innerHTML=L({bodyHtml:'<div class="empty-state">Selecciona un paciente del directorio.</div>'});return}const s=M(i.fechaNacimiento);n.innerHTML="";const e=document.createElement("div");e.className="card",e.innerHTML=`
    <div style="display:flex; gap:16px; align-items:flex-start; flex-wrap:wrap;">
      <span class="avatar-initials" style="width:64px;height:64px;font-size:20px;">${C(i.nombre+" "+i.apellidos)}</span>
      <div style="flex:1; min-width:200px;">
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <h2 style="font-size:18px;">${t(i.nombre)} ${t(i.apellidos)}</h2>
        </div>
        <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
          <span class="badge badge-primary">${s} años</span>
          <span class="badge">${t(i.sexo)}</span>
          <span class="badge badge-accent">Grupo ${t(i.grupoSanguineo)}</span>
          <span class="badge badge-success">${t(i.estado==="activo"?"Asegurado":"Inactivo")}</span>
        </div>
        <div class="text-tertiary" style="font-size:12px; margin-top:6px;">ID Paciente: ${t(i.id)}</div>
      </div>
      <div class="view-actions">
        <a class="btn btn-secondary btn-sm" href="#/historia-clinica/${i.id}">${c("history",{size:14})} Historia Clínica</a>
        <a class="btn btn-primary btn-sm" href="#/consulta/${i.id}">${c("stethoscope",{size:14})} Nueva consulta</a>
      </div>
    </div>
    <div class="view-actions" style="margin-top:14px;">
      <a class="btn btn-secondary btn-sm" href="#/recetas?pacienteId=${i.id}">${c("pill",{size:14})} Receta</a>
      <a class="btn btn-secondary btn-sm" href="#/documentos?pacienteId=${i.id}">${c("image",{size:14})} Documentos</a>
      <a class="btn btn-secondary btn-sm" href="#/agenda?pacienteId=${i.id}">${c("calendar",{size:14})} Agenda</a>
    </div>
  `,n.appendChild(e);const a=document.createElement("div");a.className="card",n.appendChild(a);const d={refresh(){const o=$("pacientes",i.id),m=p==null?void 0:p.getActive();H(o),m&&p&&p.setActive(m),A(o)}};p=R({items:z,activeId:"dashboard",ariaLabel:"Secciones del expediente del paciente",renderPanel:(o,m)=>{const g=z.find(l=>l.id===o),b=$("pacientes",i.id)||i;return g.mod.render(b,m,d)}}),a.appendChild(p.el)}function A(i){const n=document.getElementById("patient-timeline");if(!i){n.innerHTML="";return}const s=v("consultas",o=>o.pacienteId===i.id).map(o=>({date:o.fecha,label:`Consulta: ${o.motivoConsulta}`,badge:"Consulta",tone:"badge-primary"})),e=v("recetas",o=>o.pacienteId===i.id).map(o=>({date:o.fecha,label:`Receta ${o.folio}`,badge:"Prescripción",tone:"badge-accent"})),a=v("documentos",o=>o.pacienteId===i.id).map(o=>({date:o.fecha,label:o.nombre,badge:"Documento",tone:"badge-info"})),d=[...s,...e,...a].sort((o,m)=>new Date(m.date)-new Date(o.date)).slice(0,8);n.innerHTML=L({title:"Línea de tiempo",bodyHtml:d.length?`<div class="timeline">
          ${d.map(o=>`
            <div class="timeline-item">
              <div class="text-tertiary" style="font-size:11px;">${r(o.date,{withTime:!0})}</div>
              <div style="font-size:13px; font-weight:500;">${t(o.label)}</div>
              <span class="badge ${o.tone}" style="margin-top:4px;">${o.badge}</span>
            </div>
          `).join("")}
        </div>`:'<div class="empty-state">Sin actividad registrada.</div>'})}function T(){const i=`
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
  `;O({title:"Nuevo paciente",bodyHtml:i,footerHtml:`
      <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="modal-save">Guardar paciente</button>
    `,onMount:(n,s)=>{n.querySelector("#modal-cancel").addEventListener("click",s),n.querySelector("#modal-save").addEventListener("click",async()=>{const e=n.querySelector("#form-nuevo-paciente");if(!w(e))return;const a=S(e),d=await q("pacientes",{nombre:a.nombre,apellidos:a.apellidos,fechaNacimiento:a.fechaNacimiento,sexo:a.sexo,estadoCivil:a.estadoCivil||"No especificado",grupoSanguineo:a.grupoSanguineo||"No especificado",curp:"No registrado",nss:"No registrado",foto:"",contacto:{email:a.email||"",telefono:a.telefono,telefonoAlt:"",direccion:"No registrado"},aseguradora:{compania:"Particular",poliza:"",vigenciaInicio:"",vigenciaFin:"",plan:""},contactoEmergencia:{nombre:"",parentesco:"",telefono:""},alergias:[],alertas:[],referencias:[],estado:"activo",fechaRegistro:new Date().toISOString().slice(0,10)});s(),j(`#/pacientes/${d.id}`)})}})}function Ce(){x.forEach(i=>i()),x=[],p&&(p.destroy(),p=null)}export{Me as mount,Ce as unmount};
