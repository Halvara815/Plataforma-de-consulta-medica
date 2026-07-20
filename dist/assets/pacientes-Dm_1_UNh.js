import{s as S,g as I,h as C,e as s,n as $,j as h,i as x,q as m,f as u,k as N}from"./index-BbYPTjK5.js";import{c as w}from"./card-CijOLgPO.js";import{c as E}from"./tabs-Dmi9qgmk.js";import{o as H}from"./modal-sZK26qrI.js";import{t as c,s as f,v as L,g as T}from"./form-DLgGHwbw.js";let g=[];async function j(e,i={},o={}){var b;S("Pacientes","Consulta, gestiona y mantén la información clínica de tus pacientes");const a=I("pacientes"),t=o.q||"",d=t?a.filter(p=>`${p.nombre} ${p.apellidos} ${p.id}`.toLowerCase().includes(t.toLowerCase())):a,n=i.id||((b=d[0]||a[0])==null?void 0:b.id),l=n?C("pacientes",n):null;e.innerHTML=`
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Pacientes / Identificación del Paciente</h1>
          <p>Consulta, gestiona y mantén la información demográfica y clínica de tus pacientes.</p>
        </div>
        <div class="view-actions">
          <button type="button" class="btn btn-primary" id="btn-nuevo-paciente">➕ Nuevo paciente</button>
        </div>
      </div>
      <div class="three-col" id="pacientes-layout"></div>
    </div>
  `,A(e,a,d,l,t);const r=document.getElementById("btn-nuevo-paciente"),v=()=>y();r.addEventListener("click",v),g.push(()=>r.removeEventListener("click",v)),o.action==="nuevo"&&y()}function A(e,i,o,a,t){const d=document.getElementById("pacientes-layout");d.innerHTML=`
    <div class="card">
      <div class="stack" style="gap:10px;">
        <div class="table-search">
          <span aria-hidden="true">🔍</span>
          <input type="search" id="paciente-search" placeholder="Buscar pacientes…" value="${s(t)}" />
        </div>
        <div class="text-tertiary" style="font-size:11.5px;">${o.length} de ${i.length} pacientes</div>
        <div class="patient-directory" id="patient-directory"></div>
      </div>
    </div>
    <div id="patient-detail"></div>
    <div id="patient-timeline"></div>
  `,P(o,a==null?void 0:a.id),z(a),B(a),document.getElementById("paciente-search").addEventListener("input",l=>{const r=l.target.value,v=a?`#/pacientes/${a.id}`:"#/pacientes";$(`${v}?q=${encodeURIComponent(r)}`)})}function P(e,i){const o=document.getElementById("patient-directory");if(!e.length){o.innerHTML='<div class="empty-state">Sin resultados.</div>';return}o.innerHTML=e.map(a=>{const t=h(a.fechaNacimiento);return`
        <a class="patient-directory-item${a.id===i?" is-active":""}" href="#/pacientes/${a.id}">
          <span class="avatar-initials" style="width:36px;height:36px;">${x(a.nombre+" "+a.apellidos)}</span>
          <div style="min-width:0;">
            <div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s(a.nombre)} ${s(a.apellidos)}</div>
            <div class="text-tertiary" style="font-size:11.5px;">${t} años · ${s(a.id)}</div>
          </div>
        </a>
      `}).join("")}function z(e){const i=document.getElementById("patient-detail");if(!e){i.innerHTML=w({bodyHtml:'<div class="empty-state">Selecciona un paciente del directorio.</div>'});return}const o=h(e.fechaNacimiento),a=E({tabs:[{id:"resumen",label:"Resumen"},{id:"contacto",label:"Contacto & Seguros"},{id:"antecedentes",label:"Antecedentes"},{id:"alertas",label:`Alertas (${e.alertas.length})`}],activeId:"resumen",panelHtml:d=>D(d,e)});i.innerHTML="";const t=document.createElement("div");t.className="card",t.innerHTML=`
    <div style="display:flex; gap:16px; align-items:flex-start; flex-wrap:wrap;">
      <span class="avatar-initials" style="width:64px;height:64px;font-size:20px;">${x(e.nombre+" "+e.apellidos)}</span>
      <div style="flex:1; min-width:200px;">
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <h2 style="font-size:18px;">${s(e.nombre)} ${s(e.apellidos)}</h2>
        </div>
        <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap;">
          <span class="badge badge-primary">${o} años</span>
          <span class="badge">${s(e.sexo)}</span>
          <span class="badge badge-accent">Grupo ${s(e.grupoSanguineo)}</span>
          <span class="badge badge-success">${s(e.estado==="activo"?"Asegurado":"Inactivo")}</span>
        </div>
        <div class="text-tertiary" style="font-size:12px; margin-top:6px;">ID Paciente: ${s(e.id)}</div>
      </div>
      <div class="view-actions">
        <a class="btn btn-secondary btn-sm" href="#/historia-clinica/${e.id}">📄 Historia Clínica</a>
        <a class="btn btn-primary btn-sm" href="#/consulta/${e.id}">🩺 Nueva consulta</a>
      </div>
    </div>
    <div class="view-actions" style="margin-top:14px;">
      <a class="btn btn-secondary btn-sm" href="#/recetas?pacienteId=${e.id}">💊 Receta</a>
      <a class="btn btn-secondary btn-sm" href="#/documentos?pacienteId=${e.id}">🖼️ Documentos</a>
      <a class="btn btn-secondary btn-sm" href="#/agenda?pacienteId=${e.id}">📅 Agenda</a>
    </div>
  `,i.appendChild(t),i.appendChild(a.el)}function D(e,i){if(e==="resumen")return`
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Fecha de nacimiento</div><div class="info-value">${u(i.fechaNacimiento)}</div></div>
        <div class="info-item"><div class="info-label">Estado civil</div><div class="info-value">${s(i.estadoCivil)}</div></div>
        <div class="info-item"><div class="info-label">CURP</div><div class="info-value">${s(i.curp)}</div></div>
        <div class="info-item"><div class="info-label">NSS</div><div class="info-value">${s(i.nss)}</div></div>
      </div>
      <hr class="divider" style="margin:16px 0;" />
      <div class="info-item">
        <div class="info-label">Alergias y reacciones</div>
        <div class="stack" style="gap:6px; margin-top:6px;">
          ${i.alergias.length?i.alergias.map(o=>`<div><span class="badge badge-danger">${s(o.sustancia)}</span> <span class="text-tertiary" style="font-size:12px;">Reacción: ${s(o.reaccion)}</span></div>`).join(""):'<span class="text-tertiary">Sin alergias registradas.</span>'}
        </div>
      </div>
    `;if(e==="contacto")return`
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Email</div><div class="info-value">${s(i.contacto.email)}</div></div>
        <div class="info-item"><div class="info-label">Teléfono</div><div class="info-value">${s(i.contacto.telefono)}</div></div>
        <div class="info-item"><div class="info-label">Domicilio</div><div class="info-value">${s(i.contacto.direccion)}</div></div>
        <div class="info-item"><div class="info-label">Contacto de emergencia</div><div class="info-value">${s(i.contactoEmergencia.nombre)} (${s(i.contactoEmergencia.parentesco)})</div></div>
      </div>
      <hr class="divider" style="margin:16px 0;" />
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Aseguradora</div><div class="info-value">${s(i.aseguradora.compania)}</div></div>
        <div class="info-item"><div class="info-label">Póliza</div><div class="info-value">${s(i.aseguradora.poliza)}</div></div>
        <div class="info-item"><div class="info-label">Plan</div><div class="info-value">${s(i.aseguradora.plan)}</div></div>
        <div class="info-item"><div class="info-label">Vigencia</div><div class="info-value">${u(i.aseguradora.vigenciaInicio)} – ${u(i.aseguradora.vigenciaFin)}</div></div>
      </div>
    `;if(e==="antecedentes"){const a=m("consultas",t=>t.pacienteId===i.id).sort((t,d)=>new Date(d.fecha)-new Date(t.fecha))[0];return a?`
      <div class="stack">
        <div class="info-item"><div class="info-label">Heredofamiliares</div><div class="info-value">${s(a.antecedentes.heredofamiliares||"Sin información")}</div></div>
        <div class="info-item"><div class="info-label">Personales patológicos</div><div class="info-value">${s(a.antecedentes.personalesPatologicos||"Sin información")}</div></div>
        <div class="info-item"><div class="info-label">Personales no patológicos</div><div class="info-value">${s(a.antecedentes.personalesNoPatologicos||"Sin información")}</div></div>
      </div>
    `:'<div class="empty-state">Sin antecedentes registrados todavía.</div>'}return e==="alertas"?i.alertas.length?`
      <div class="stack">
        ${i.alertas.map(o=>`
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border-color);">
            <div>
              <div style="font-size:13px; font-weight:600;">${s(o.tipo)}</div>
              <div class="text-tertiary" style="font-size:12px;">${s(o.descripcion)}</div>
            </div>
            <span class="badge ${o.activa?"badge-warning":""}">${o.activa?"Activa":"Resuelta"}</span>
          </div>
        `).join("")}
      </div>
    `:'<div class="empty-state">Sin alertas clínicas activas.</div>':""}function B(e){const i=document.getElementById("patient-timeline");if(!e){i.innerHTML="";return}const o=m("consultas",n=>n.pacienteId===e.id).map(n=>({date:n.fecha,label:`Consulta: ${n.motivoConsulta}`,badge:"Consulta",tone:"badge-primary"})),a=m("recetas",n=>n.pacienteId===e.id).map(n=>({date:n.fecha,label:`Receta ${n.folio}`,badge:"Prescripción",tone:"badge-accent"})),t=m("documentos",n=>n.pacienteId===e.id).map(n=>({date:n.fecha,label:n.nombre,badge:"Documento",tone:"badge-info"})),d=[...o,...a,...t].sort((n,l)=>new Date(l.date)-new Date(n.date)).slice(0,8);i.innerHTML=w({title:"Línea de tiempo",bodyHtml:d.length?`<div class="timeline">
          ${d.map(n=>`
            <div class="timeline-item">
              <div class="text-tertiary" style="font-size:11px;">${u(n.date,{withTime:!0})}</div>
              <div style="font-size:13px; font-weight:500;">${s(n.label)}</div>
              <span class="badge ${n.tone}" style="margin-top:4px;">${n.badge}</span>
            </div>
          `).join("")}
        </div>`:'<div class="empty-state">Sin actividad registrada.</div>'})}function y(){const e=`
    <form id="form-nuevo-paciente" class="form-grid">
      ${c({name:"nombre",label:"Nombre(s)",required:!0})}
      ${c({name:"apellidos",label:"Apellidos",required:!0})}
      ${c({name:"fechaNacimiento",label:"Fecha de nacimiento",type:"date",required:!0})}
      ${f({name:"sexo",label:"Sexo",options:["Masculino","Femenino"],required:!0})}
      ${f({name:"estadoCivil",label:"Estado civil",options:["Soltero(a)","Casado(a)","Divorciado(a)","Viudo(a)"]})}
      ${f({name:"grupoSanguineo",label:"Grupo sanguíneo",options:["O+","O-","A+","A-","B+","B-","AB+","AB-"]})}
      ${c({name:"email",label:"Email",type:"email"})}
      ${c({name:"telefono",label:"Teléfono",required:!0})}
    </form>
  `;H({title:"Nuevo paciente",bodyHtml:e,footerHtml:`
      <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="modal-save">Guardar paciente</button>
    `,onMount:(i,o)=>{i.querySelector("#modal-cancel").addEventListener("click",o),i.querySelector("#modal-save").addEventListener("click",async()=>{const a=i.querySelector("#form-nuevo-paciente");if(!L(a))return;const t=T(a),d=await N("pacientes",{nombre:t.nombre,apellidos:t.apellidos,fechaNacimiento:t.fechaNacimiento,sexo:t.sexo,estadoCivil:t.estadoCivil||"No especificado",grupoSanguineo:t.grupoSanguineo||"No especificado",curp:"No registrado",nss:"No registrado",foto:"",contacto:{email:t.email||"",telefono:t.telefono,telefonoAlt:"",direccion:"No registrado"},aseguradora:{compania:"Particular",poliza:"",vigenciaInicio:"",vigenciaFin:"",plan:""},contactoEmergencia:{nombre:"",parentesco:"",telefono:""},alergias:[],alertas:[],estado:"activo",fechaRegistro:new Date().toISOString().slice(0,10)});o(),$(`#/pacientes/${d.id}`)})}})}function G(){g.forEach(e=>e()),g=[]}export{j as mount,G as unmount};
