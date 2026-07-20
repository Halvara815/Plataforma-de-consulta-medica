import{s as g,g as u,e as o,f as p,h as y,r as h,k as I}from"./index-BbYPTjK5.js";import{c as l}from"./card-CijOLgPO.js";import{o as $}from"./modal-sZK26qrI.js";import{t as w,s as r,a as x,v as E,g as L}from"./form-DLgGHwbw.js";const b={imagen:"🩻",documento:"📄",nota:"📝"};let v=[],n={tipo:"todos",search:"",selectedId:null,pacienteFiltro:null};async function q(e,t={},i={}){g("Imágenes / Documentos","Visualice, administre y prescriba desde un solo lugar"),n={tipo:"todos",search:"",selectedId:null,pacienteFiltro:i.pacienteId||null},e.innerHTML=`
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Imágenes / Documentos Médicos</h1>
          <p>Visualice, administre y organice estudios, imágenes y documentos clínicos.</p>
        </div>
        <div class="view-actions">
          <button type="button" class="btn btn-primary" id="btn-subir-archivo">📤 Subir archivo</button>
        </div>
      </div>
      <div class="two-col">
        <div class="card">
          <div class="stack" style="gap:10px;">
            <div class="table-search">
              <span aria-hidden="true">🔍</span>
              <input type="search" id="doc-search" placeholder="Buscar archivos…" />
            </div>
            <div class="tabs" role="tablist" id="doc-type-tabs">
              ${["todos","imagen","documento","nota"].map(a=>`<button type="button" class="tab-btn${a==="todos"?" is-active":""}" data-tipo="${a}">${a==="todos"?"Todos":a==="imagen"?"Imágenes":a==="documento"?"Documentos":"Notas"}</button>`).join("")}
            </div>
            <div class="patient-directory" id="doc-list"></div>
          </div>
        </div>
        <div class="stack">
          <div id="doc-viewer"></div>
          <div id="doc-info"></div>
        </div>
      </div>
    </div>
  `,d(),document.getElementById("btn-subir-archivo").addEventListener("click",m),document.getElementById("doc-search").addEventListener("input",a=>{n.search=a.target.value,d()}),document.getElementById("doc-type-tabs").addEventListener("click",a=>{a.target.matches("[data-tipo]")&&(n.tipo=a.target.dataset.tipo,document.querySelectorAll("#doc-type-tabs .tab-btn").forEach(s=>s.classList.toggle("is-active",s===a.target)),d())}),i.action==="subir"&&m()}function H(){let e=u("documentos");if(n.pacienteFiltro&&(e=e.filter(t=>t.pacienteId===n.pacienteFiltro)),n.tipo!=="todos"&&(e=e.filter(t=>t.tipo===n.tipo)),n.search){const t=n.search.toLowerCase();e=e.filter(i=>`${i.nombre} ${i.categoria} ${i.tags.join(" ")}`.toLowerCase().includes(t))}return[...e].sort((t,i)=>new Date(i.fecha)-new Date(t.fecha))}function d(){var t;const e=H();(!n.selectedId||!e.some(i=>i.id===n.selectedId))&&(n.selectedId=((t=e[0])==null?void 0:t.id)||null),S(e),T(e.find(i=>i.id===n.selectedId))}function S(e){const t=document.getElementById("doc-list");if(!e.length){t.innerHTML='<div class="empty-state">Sin archivos que coincidan.</div>';return}t.innerHTML=e.map(i=>`
      <div class="patient-directory-item${i.id===n.selectedId?" is-active":""}" data-doc-id="${i.id}">
        <span style="font-size:20px;">${b[i.tipo]||"📄"}</span>
        <div style="min-width:0;">
          <div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${o(i.nombre)}</div>
          <div class="text-tertiary" style="font-size:11.5px;">${p(i.fecha,{withTime:!0})}</div>
        </div>
      </div>
    `).join(""),t.querySelectorAll("[data-doc-id]").forEach(i=>{i.addEventListener("click",()=>{n.selectedId=i.dataset.docId,d()})})}function T(e){const t=document.getElementById("doc-viewer"),i=document.getElementById("doc-info");if(!e){t.innerHTML=l({bodyHtml:'<div class="empty-state">Selecciona un archivo del listado.</div>'}),i.innerHTML="";return}const a=y("pacientes",e.pacienteId);t.innerHTML=l({title:e.nombre,actionsHtml:`
      <button type="button" class="btn btn-secondary btn-sm" id="btn-imprimir-doc">🖨 Imprimir</button>
      <button type="button" class="btn btn-danger btn-sm" id="btn-eliminar-doc">🗑 Eliminar</button>
    `,bodyHtml:`
      <div style="display:flex; align-items:center; justify-content:center; background:var(--bg-surface-alt); border:1px dashed var(--border-color-strong); border-radius:var(--radius-md); height:280px; font-size:64px;">
        ${b[e.tipo]||"📄"}
      </div>
      <div class="text-tertiary" style="font-size:11.5px; margin-top:8px; text-align:center;">
        Vista previa simulada (fase 1 sin backend) · ${o(e.tamano)}
      </div>
    `}),i.innerHTML=l({title:"Información y etiquetas",bodyHtml:`
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Paciente</div><div class="info-value">${a?`${o(a.nombre)} ${o(a.apellidos)}`:"No asociado"}</div></div>
        <div class="info-item"><div class="info-label">Categoría</div><div class="info-value">${o(e.categoria)}</div></div>
        <div class="info-item"><div class="info-label">Fuente</div><div class="info-value">${o(e.fuente||"—")}</div></div>
        <div class="info-item"><div class="info-label">Modalidad</div><div class="info-value">${o(e.modalidad||"—")}</div></div>
        <div class="info-item"><div class="info-label">Técnico</div><div class="info-value">${o(e.tecnico||"—")}</div></div>
        <div class="info-item"><div class="info-label">Fecha</div><div class="info-value">${p(e.fecha,{withTime:!0})}</div></div>
      </div>
      <hr class="divider" style="margin:14px 0;" />
      <div class="info-item">
        <div class="info-label">Descripción / Notas</div>
        <div class="info-value">${o(e.descripcion||"Sin descripción.")}</div>
      </div>
      <div class="info-item" style="margin-top:10px;">
        <div class="info-label">Etiquetas</div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
          ${e.tags.map(s=>`<span class="badge badge-primary">${o(s)}</span>`).join("")||'<span class="text-tertiary">Sin etiquetas</span>'}
        </div>
      </div>
    `}),document.getElementById("btn-imprimir-doc").addEventListener("click",()=>window.print()),document.getElementById("btn-eliminar-doc").addEventListener("click",async()=>{confirm(`¿Eliminar "${e.nombre}" de la demo? Esta acción solo afecta los datos locales.`)&&(await h("documentos",e.id),n.selectedId=null,d())})}function m(){const e=u("pacientes"),t=`
    <form id="form-subir-doc" class="form-grid">
      ${w({name:"nombre",label:"Nombre del archivo",required:!0,span2:!0})}
      ${r({name:"pacienteId",label:"Paciente",required:!0,span2:!0,value:n.pacienteFiltro||"",options:e.map(i=>({value:i.id,label:`${i.nombre} ${i.apellidos}`}))})}
      ${r({name:"tipo",label:"Tipo",options:[{value:"imagen",label:"Imagen"},{value:"documento",label:"Documento"},{value:"nota",label:"Nota"}]})}
      ${r({name:"categoria",label:"Categoría",options:["RX","Laboratorio","Nota","Informe","DICOM","Evolución","Electrocardiograma"]})}
      ${x({name:"descripcion",label:"Descripción",span2:!0,rows:2})}
    </form>
    <p class="text-tertiary" style="font-size:12px; margin-top:8px;">Esta demo simula la carga: no se sube ningún archivo real a ningún servidor.</p>
  `;$({title:"Subir archivo",bodyHtml:t,footerHtml:`
      <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="modal-save">Guardar</button>
    `,onMount:(i,a)=>{i.querySelector("#modal-cancel").addEventListener("click",a),i.querySelector("#modal-save").addEventListener("click",async()=>{const s=i.querySelector("#form-subir-doc");if(!E(s))return;const c=L(s),f=await I("documentos",{pacienteId:c.pacienteId,tipo:c.tipo,categoria:c.categoria,nombre:c.nombre,fecha:new Date().toISOString(),fuente:"Carga manual (demo)",modalidad:"",tecnico:"",tags:[],descripcion:c.descripcion||"",tamano:"—"});a(),n.selectedId=f.id,d()})}})}function B(){v.forEach(e=>e()),v=[]}export{q as mount,B as unmount};
