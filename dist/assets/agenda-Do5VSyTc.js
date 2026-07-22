import{s as w,i as E,o as h,g as v,e as s,b as p,j as y,a as b,f as x,u as C,m as H}from"./index-kGilWOpK.js";import{c as m}from"./card-DxPzD0eG.js";import{o as L}from"./modal-C8_1gc2H.js";import{s as f,t as r,v as B,g as T}from"./form-ORHtGPKz.js";const u="2026-07-20",M=24*60*60*1e3;let I=[],a={date:u,medicoId:"",consultorio:"",estado:"",selectedCitaId:null};async function G(e,o={},t={}){w("Agenda / Citas","Gestione y programe las citas de sus pacientes"),a={date:u,medicoId:"",consultorio:"",estado:"",selectedCitaId:null},e.innerHTML=`
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Agenda / Citas</h1>
          <p>Gestione y programe las citas de sus pacientes</p>
        </div>
        <div class="view-actions">
          <button type="button" class="btn btn-primary" id="btn-nueva-cita">${E("plus",{size:15})} Nueva cita</button>
        </div>
      </div>

      <div class="card">
        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; justify-content:space-between;">
          <div style="display:flex; gap:8px; align-items:center;">
            <button type="button" class="btn btn-ghost btn-sm" id="btn-prev-day">‹</button>
            <input type="date" class="input" id="agenda-date-input" value="${a.date}" style="width:auto;" />
            <button type="button" class="btn btn-ghost btn-sm" id="btn-next-day">›</button>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-today">Hoy</button>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <select class="input" id="filter-medico" style="width:auto;"></select>
            <select class="input" id="filter-consultorio" style="width:auto;"></select>
            <select class="input" id="filter-estado" style="width:auto;"></select>
          </div>
        </div>
      </div>

      <div class="two-col">
        <div id="agenda-list-container"></div>
        <div class="stack">
          <div id="agenda-detail-container"></div>
          <div id="agenda-summary-container"></div>
        </div>
      </div>
    </div>
  `,F(),c(),document.getElementById("btn-nueva-cita").addEventListener("click",D),document.getElementById("agenda-date-input").addEventListener("change",i=>{a.date=i.target.value,a.selectedCitaId=null,c()}),document.getElementById("btn-prev-day").addEventListener("click",()=>$(-1)),document.getElementById("btn-next-day").addEventListener("click",()=>$(1)),document.getElementById("btn-today").addEventListener("click",()=>{a.date=u,document.getElementById("agenda-date-input").value=u,c()}),["filter-medico","filter-consultorio","filter-estado"].forEach(i=>{document.getElementById(i).addEventListener("change",n=>{const d=i==="filter-medico"?"medicoId":i==="filter-consultorio"?"consultorio":"estado";a[d]=n.target.value,c()})}),t.pacienteId&&(a.pacienteFiltro=t.pacienteId)}function $(e){const o=new Date(`${a.date}T00:00:00`);o.setTime(o.getTime()+e*M),a.date=o.toISOString().slice(0,10),document.getElementById("agenda-date-input").value=a.date,a.selectedCitaId=null,c()}function F(){const e=h(),o=v("medicos"),t=document.getElementById("filter-medico");t.innerHTML='<option value="">Todos los doctores</option>'+o.map(d=>`<option value="${d.id}">${s(d.nombre)}</option>`).join("");const i=document.getElementById("filter-consultorio");i.innerHTML='<option value="">Todos los consultorios</option>'+e.consultorios.map(d=>`<option value="${s(d)}">${s(d)}</option>`).join("");const n=document.getElementById("filter-estado");n.innerHTML='<option value="">Todos los estados</option>'+e.estadosCita.map(d=>`<option value="${d}">${p(d)}</option>`).join("")}function k(){return v("citas").filter(e=>e.fecha===a.date).filter(e=>!a.medicoId||e.medicoId===a.medicoId).filter(e=>!a.consultorio||e.consultorioId===a.consultorio).filter(e=>!a.estado||e.estado===a.estado).filter(e=>!a.pacienteFiltro||e.pacienteId===a.pacienteFiltro).sort((e,o)=>e.horaInicio.localeCompare(o.horaInicio))}function c(){var o,t;const e=k();(!a.selectedCitaId||!e.some(i=>i.id===a.selectedCitaId))&&(a.selectedCitaId=((o=e.find(i=>i.pacienteId))==null?void 0:o.id)||((t=e[0])==null?void 0:t.id)||null),S(e),j(e.find(i=>i.id===a.selectedCitaId)),q(e)}function S(e){const o=document.getElementById("agenda-list-container");o.innerHTML=m({title:`Agenda · ${x(a.date)}`,bodyHtml:e.length?`<div class="stack" id="agenda-list">${e.map(t=>{const i=t.pacienteId?y("pacientes",t.pacienteId):null,n=i?`${i.nombre} ${i.apellidos}`:t.motivo;return`
              <div class="patient-directory-item${t.id===a.selectedCitaId?" is-active":""}" data-cita-id="${t.id}" style="justify-content:space-between;">
                <div style="display:flex; gap:12px; align-items:center; min-width:0;">
                  <strong style="min-width:48px; font-size:12.5px; color:var(--text-secondary);">${t.horaInicio}</strong>
                  <div style="min-width:0;">
                    <div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s(n)}</div>
                    <div class="text-tertiary" style="font-size:11.5px;">${s(i?t.motivo:t.consultorioId)}</div>
                  </div>
                </div>
                <span class="badge ${b(t.estado)}">${p(t.estado)}</span>
              </div>
            `}).join("")}</div>`:'<div class="empty-state">No hay citas para esta fecha con los filtros seleccionados.</div>'}),o.querySelectorAll("[data-cita-id]").forEach(t=>{t.addEventListener("click",()=>{a.selectedCitaId=t.dataset.citaId,c()})})}function j(e){const o=document.getElementById("agenda-detail-container");if(!e){o.innerHTML=m({title:"Detalle de la cita",bodyHtml:'<div class="empty-state">Selecciona una cita.</div>'});return}const t=e.pacienteId?y("pacientes",e.pacienteId):null,i=y("medicos",e.medicoId);o.innerHTML=m({title:"Detalle de la cita",bodyHtml:`
      <div class="stack">
        ${t?`<div><strong>${s(t.nombre)} ${s(t.apellidos)}</strong><div class="text-tertiary" style="font-size:12px;">ID: ${s(t.id)}</div></div>`:`<div><strong>${s(e.motivo)}</strong></div>`}
        <div class="info-grid">
          <div class="info-item"><div class="info-label">Fecha</div><div class="info-value">${x(e.fecha)}</div></div>
          <div class="info-item"><div class="info-label">Hora</div><div class="info-value">${e.horaInicio} - ${e.horaFin}</div></div>
          <div class="info-item"><div class="info-label">Consultorio</div><div class="info-value">${s(e.consultorioId)}</div></div>
          <div class="info-item"><div class="info-label">Médico</div><div class="info-value">${s((i==null?void 0:i.nombre)||"—")}</div></div>
        </div>
        ${e.motivo&&t?`<div class="info-item"><div class="info-label">Motivo</div><div class="info-value">${s(e.motivo)}</div></div>`:""}
        ${e.notas?`<div class="info-item"><div class="info-label">Notas</div><div class="info-value">${s(e.notas)}</div></div>`:""}
        <span class="badge ${b(e.estado)}" style="width:fit-content;">${p(e.estado)}</span>
        ${t?`<div class="view-actions" style="margin-top:6px;">
                <a class="btn btn-primary btn-sm" href="#/consulta/${t.id}">Iniciar consulta</a>
                <a class="btn btn-secondary btn-sm" href="#/historia-clinica/${t.id}">Historia clínica</a>
                <button type="button" class="btn btn-danger btn-sm" id="btn-cancelar-cita" ${e.estado==="cancelada"?"disabled":""}>Cancelar cita</button>
              </div>`:""}
      </div>
    `});const n=document.getElementById("btn-cancelar-cita");n&&n.addEventListener("click",async()=>{await C("citas",e.id,{estado:"cancelada"}),c()})}function q(e){const o=document.getElementById("agenda-summary-container"),t=e.reduce((i,n)=>(i[n.estado]=(i[n.estado]||0)+1,i),{});o.innerHTML=m({title:"Resumen del día",bodyHtml:`
      <div class="stack" style="gap:6px;">
        <div style="display:flex; justify-content:space-between; font-size:13px;"><span>Total de citas</span><strong>${e.length}</strong></div>
        ${Object.entries(t).map(([i,n])=>`<div style="display:flex; justify-content:space-between; font-size:12.5px;"><span class="badge ${b(i)}">${p(i)}</span><span>${n}</span></div>`).join("")}
      </div>
    `})}function D(){const e=v("pacientes"),o=v("medicos"),t=h(),i=`
    <form id="form-nueva-cita" class="form-grid">
      ${f({name:"pacienteId",label:"Paciente",required:!0,span2:!0,options:e.map(n=>({value:n.id,label:`${n.nombre} ${n.apellidos}`}))})}
      ${f({name:"medicoId",label:"Médico",required:!0,options:o.map(n=>({value:n.id,label:n.nombre}))})}
      ${f({name:"consultorioId",label:"Consultorio",required:!0,options:t.consultorios})}
      ${r({name:"fecha",label:"Fecha",type:"date",required:!0,value:a.date})}
      ${r({name:"horaInicio",label:"Hora inicio",type:"time",required:!0})}
      ${r({name:"horaFin",label:"Hora fin",type:"time",required:!0})}
      ${r({name:"motivo",label:"Motivo de consulta",span2:!0,required:!0})}
    </form>
  `;L({title:"Nueva cita",bodyHtml:i,footerHtml:`
      <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="modal-save">Guardar cita</button>
    `,onMount:(n,d)=>{n.querySelector("#modal-cancel").addEventListener("click",d),n.querySelector("#modal-save").addEventListener("click",async()=>{const g=n.querySelector("#form-nueva-cita");if(!B(g))return;const l=T(g);await H("citas",{pacienteId:l.pacienteId,medicoId:l.medicoId,consultorioId:l.consultorioId,fecha:l.fecha,horaInicio:l.horaInicio,horaFin:l.horaFin,motivo:l.motivo,estado:"confirmada",notas:"",recordatorios:[]}),d(),a.date=l.fecha,document.getElementById("agenda-date-input").value=l.fecha,c()})}})}function R(){I.forEach(e=>e()),I=[]}export{G as mount,R as unmount};
