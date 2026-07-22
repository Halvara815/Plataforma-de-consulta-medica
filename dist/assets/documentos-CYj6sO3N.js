import{s as D,t as F,i as p,m as A,v as y,e as c,f as L,g as H,j as M,w as j,u as z,x as R}from"./index-HXJRJ7id.js";import{c as w}from"./card-DyJCkSMh.js";import{o as q}from"./modal-BHhV6Xsj.js";import{s as T,t as E,a as O,v as U,g as N}from"./form-xX5eYAiU.js";import{s as u}from"./toast-DAoH9M8M.js";const B=["Radiografía","Resonancia","Tomografía","Ecografía","Fotografía clínica","Laboratorio","Receta","Consentimiento","Informe médico","Electrocardiograma","DICOM","Evolución","Nota","Otro"],V={pdf:"Informe médico",doc:"Informe médico",docx:"Informe médico",xls:"Laboratorio",xlsx:"Laboratorio",csv:"Laboratorio",txt:"Nota",dcm:"DICOM"},G={pdf:"file-text",doc:"file-text",docx:"file-text",xls:"file-spreadsheet",xlsx:"file-spreadsheet",csv:"file-spreadsheet",txt:"file-text",dcm:"file"};let o={tipo:"todos",categoria:"",search:"",selectedId:null,pacienteFiltro:null,view:"list"},g=new Map,v=[],W=0,x=[];function k(e=""){const a=/\.([a-z0-9]+)$/i.exec(e);return a?a[1].toLowerCase():""}function X(e){return V[k(e.name)]||(e.type.startsWith("image/")?"Fotografía clínica":"Otro")}function h(e){return e.tipo==="imagen"?"image":e.tipo==="nota"?"note":G[k(e.nombre)]||"file-text"}function b(e){if(!e.blob)return null;const a=g.get(e.id);if(a&&a.blob===e.blob)return a.url;a&&URL.revokeObjectURL(a.url);const t=URL.createObjectURL(e.blob);return g.set(e.id,{blob:e.blob,url:t}),t}function P(){g.forEach(({url:e})=>URL.revokeObjectURL(e)),g.clear()}async function te(e,a={},t={}){D("Imágenes / Documentos","Gestor completo de archivos e imágenes clínicas");const{currentUser:d}=F.getState();o={tipo:t.tipo&&["imagen","documento","nota"].includes(t.tipo)?t.tipo:"todos",categoria:"",search:"",selectedId:t.doc||null,pacienteFiltro:t.pacienteId||null,view:"list"},v=[],e.innerHTML=`
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Imágenes / Documentos Médicos</h1>
          <p>Cargue, organice y administre estudios, imágenes y documentos clínicos.</p>
        </div>
        <div class="view-actions">
          <button type="button" class="btn btn-primary" id="btn-subir-archivo">${p("upload",{size:15})} Subir archivo</button>
        </div>
      </div>

      <div class="card">
        <div id="dropzone" class="dropzone" tabindex="0" role="button" aria-label="Zona de carga de archivos">
          ${p("upload-cloud")}
          <strong>Arrastra archivos aquí o haz clic para seleccionar</strong>
          <span class="text-tertiary" style="font-size:12px;">Imágenes (radiografías, resonancias, tomografías, ecografías, fotos clínicas) y documentos (PDF, Word, Excel, TXT)</span>
          <input type="file" id="file-input" multiple style="display:none;" />
        </div>
        <div id="upload-queue" class="upload-queue" style="margin-top:12px;"></div>
      </div>

      <div class="two-col">
        <div class="card">
          <div class="stack" style="gap:10px;">
            <div class="file-toolbar">
              <div class="table-search" style="flex:1;">
                ${p("search",{size:16})}
                <input type="search" id="doc-search" placeholder="Buscar archivos por nombre, categoría o etiqueta…" />
              </div>
              <div class="view-toggle" role="group" aria-label="Cambiar vista">
                <button type="button" data-view="list" class="is-active" aria-label="Vista de lista" aria-pressed="true">${p("list",{size:16})}</button>
                <button type="button" data-view="grid" aria-label="Vista de cuadrícula" aria-pressed="false">${p("grid",{size:16})}</button>
              </div>
            </div>
            <div class="tabs" role="tablist" id="doc-type-tabs">
              ${["todos","imagen","documento","nota"].map(i=>`<button type="button" class="tab-btn${i===o.tipo?" is-active":""}" data-tipo="${i}" role="tab" aria-selected="${i===o.tipo}">${i==="todos"?"Todos":i==="imagen"?"Imágenes":i==="documento"?"Documentos":"Notas"}</button>`).join("")}
            </div>
            ${T({name:"categoria-filter",label:"Filtrar por categoría",value:"",options:[{value:"",label:"Todas las categorías"},...B.map(i=>({value:i,label:i}))]})}
            <div class="text-tertiary" id="doc-count" style="font-size:11.5px;"></div>
            <div id="doc-list"></div>
          </div>
        </div>
        <div class="stack">
          <div id="doc-viewer"></div>
          <div id="doc-info"></div>
        </div>
      </div>
    </div>
  `,m();const r=document.getElementById("dropzone"),n=document.getElementById("file-input");document.getElementById("btn-subir-archivo").addEventListener("click",()=>n.click()),r.addEventListener("click",()=>n.click()),r.addEventListener("keydown",i=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),n.click())}),["dragenter","dragover"].forEach(i=>r.addEventListener(i,s=>{s.preventDefault(),r.classList.add("is-dragover")})),["dragleave","drop"].forEach(i=>r.addEventListener(i,s=>{s.preventDefault(),r.classList.remove("is-dragover")})),r.addEventListener("drop",i=>{var s,l;(l=(s=i.dataTransfer)==null?void 0:s.files)!=null&&l.length&&I(i.dataTransfer.files,d)}),n.addEventListener("change",i=>{var s;(s=i.target.files)!=null&&s.length&&I(i.target.files,d),n.value=""}),document.getElementById("doc-search").addEventListener("input",i=>{o.search=i.target.value,m()}),document.getElementById("doc-type-tabs").addEventListener("click",i=>{i.target.matches("[data-tipo]")&&(o.tipo=i.target.dataset.tipo,document.querySelectorAll("#doc-type-tabs .tab-btn").forEach(s=>{const l=s===i.target;s.classList.toggle("is-active",l),s.setAttribute("aria-selected",String(l))}),m())}),document.getElementById("f-categoria-filter").addEventListener("change",i=>{o.categoria=i.target.value,m()}),document.querySelectorAll(".view-toggle [data-view]").forEach(i=>{i.addEventListener("click",()=>{o.view=i.dataset.view,document.querySelectorAll(".view-toggle [data-view]").forEach(s=>{const l=s===i;s.classList.toggle("is-active",l),s.setAttribute("aria-pressed",String(l))}),C(S())})}),t.action==="subir"&&n.click()}function I(e,a){Array.from(e).forEach(t=>{const d=`up-${++W}`,r={uploadId:d,name:t.name,progress:0};v.push(r),f();const n=new FileReader;n.onprogress=i=>{i.lengthComputable&&(r.progress=Math.round(i.loaded/i.total*100),f())},n.onerror=()=>{v=v.filter(i=>i.uploadId!==d),f(),u({message:`No se pudo leer "${t.name}".`,tone:"danger"})},n.onload=async()=>{r.progress=100,f();const i=await A("documentos",{pacienteId:o.pacienteFiltro,tipo:t.type.startsWith("image/")?"imagen":"documento",categoria:X(t),nombre:t.name,fecha:new Date().toISOString(),fuente:"Carga manual",modalidad:"",tecnico:"",mimeType:t.type,sizeBytes:t.size,blob:t,uploadedBy:a.nombre,tags:[],descripcion:"",tamano:y(t.size)});setTimeout(()=>{v=v.filter(s=>s.uploadId!==d),f()},500),o.selectedId=i.id,m(),u({message:`"${t.name}" se cargó correctamente.`,tone:"success"})},n.readAsArrayBuffer(t)})}function f(){const e=document.getElementById("upload-queue");e&&(e.innerHTML=v.map(a=>`
      <div class="upload-progress-row">
        <span style="min-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c(a.name)}</span>
        <div class="upload-progress"><div class="upload-progress-bar" style="width:${a.progress}%;"></div></div>
        <span style="width:36px; text-align:right;">${a.progress}%</span>
      </div>`).join(""))}function S(){let e=H("documentos");if(o.pacienteFiltro&&(e=e.filter(a=>a.pacienteId===o.pacienteFiltro)),o.tipo!=="todos"&&(e=e.filter(a=>a.tipo===o.tipo)),o.categoria&&(e=e.filter(a=>a.categoria===o.categoria)),o.search){const a=o.search.toLowerCase();e=e.filter(t=>`${t.nombre} ${t.categoria} ${(t.tags||[]).join(" ")}`.toLowerCase().includes(a))}return[...e].sort((a,t)=>new Date(t.fecha)-new Date(a.fecha))}function m(){var t;const e=S();(!o.selectedId||!e.some(d=>d.id===o.selectedId))&&(o.selectedId=((t=e[0])==null?void 0:t.id)||null);const a=document.getElementById("doc-count");a&&(a.textContent=`${e.length} archivo(s)`),C(e),Q(e.find(d=>d.id===o.selectedId))}function C(e){const a=document.getElementById("doc-list");if(!e.length){a.innerHTML='<div class="empty-state">Sin archivos que coincidan.</div>';return}o.view==="grid"?a.innerHTML=`<div class="file-grid">
      ${e.map(t=>`
        <div class="file-card${t.id===o.selectedId?" is-active":""}" data-doc-id="${t.id}">
          <div class="file-card-thumb">${t.tipo==="imagen"&&b(t)?`<img src="${b(t)}" alt="" />`:p(h(t),{size:26})}</div>
          <div class="file-card-name">${c(t.nombre)}</div>
          <div class="file-card-meta"><span>${c(t.categoria||"")}</span><span>${y(t.sizeBytes)}</span></div>
        </div>`).join("")}
    </div>`:a.innerHTML=`<div class="patient-directory">
      ${e.map(t=>`
        <div class="patient-directory-item${t.id===o.selectedId?" is-active":""}" data-doc-id="${t.id}">
          <span class="file-type-icon">${t.tipo==="imagen"&&b(t)?`<img src="${b(t)}" alt="" />`:p(h(t),{size:18})}</span>
          <div style="min-width:0;">
            <div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c(t.nombre)}</div>
            <div class="text-tertiary" style="font-size:11.5px;">${c(t.categoria||"")} · ${L(t.fecha,{withTime:!0})}</div>
          </div>
        </div>`).join("")}
    </div>`,a.querySelectorAll("[data-doc-id]").forEach(t=>{t.addEventListener("click",()=>{o.selectedId=t.dataset.docId,m()})})}function Q(e){const a=document.getElementById("doc-viewer"),t=document.getElementById("doc-info");if(!e){a.innerHTML=w({bodyHtml:'<div class="empty-state">Selecciona un archivo del listado.</div>'}),t.innerHTML="";return}const d=M("pacientes",e.pacienteId),r=b(e);let n;e.tipo==="imagen"&&r?n=`<div class="file-preview-placeholder" style="padding:0; height:320px;"><img src="${r}" alt="${c(e.nombre)}" style="max-width:100%; max-height:100%; object-fit:contain;" /></div>`:e.mimeType==="application/pdf"&&r?n=`<iframe class="file-preview-frame" src="${r}" title="${c(e.nombre)}"></iframe>`:r?n=`<div class="file-preview-placeholder">${p(h(e),{size:56})}</div>
      <div class="text-tertiary" style="font-size:11.5px; margin-top:8px; text-align:center;">Vista previa no disponible para este tipo de archivo. Descárgalo para verlo.</div>`:n=`<div class="file-preview-placeholder">${p(h(e),{size:56})}</div>
      <div class="text-tertiary" style="font-size:11.5px; margin-top:8px; text-align:center;">Vista previa simulada (dato de demostración sin archivo real)</div>`,a.innerHTML=w({title:e.nombre,actionsHtml:`
      <button type="button" class="btn btn-secondary btn-sm" id="btn-descargar-doc">${p("download",{size:14})} Descargar</button>
      <button type="button" class="btn btn-secondary btn-sm" id="btn-editar-doc">${p("edit",{size:14})} Editar</button>
      <button type="button" class="btn btn-secondary btn-sm" id="btn-reemplazar-doc">${p("refresh",{size:14})} Reemplazar</button>
      <button type="button" class="btn btn-secondary btn-sm" id="btn-compartir-doc">${p("share",{size:14})} Compartir</button>
      <button type="button" class="btn btn-secondary btn-sm" id="btn-imprimir-doc">${p("printer",{size:14})} Imprimir</button>
      <button type="button" class="btn btn-danger btn-sm" id="btn-eliminar-doc">${p("trash",{size:14})} Eliminar</button>
    `,bodyHtml:`
      ${n}
      <input type="file" id="replace-input" style="display:none;" />
    `}),t.innerHTML=w({title:"Información y etiquetas",bodyHtml:`
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Paciente</div><div class="info-value">${d?`${c(d.nombre)} ${c(d.apellidos)}`:"No asociado"}</div></div>
        <div class="info-item"><div class="info-label">Categoría</div><div class="info-value">${c(e.categoria)}</div></div>
        <div class="info-item"><div class="info-label">Tamaño</div><div class="info-value">${y(e.sizeBytes)!=="—"?y(e.sizeBytes):c(e.tamano||"—")}</div></div>
        <div class="info-item"><div class="info-label">Cargado por</div><div class="info-value">${c(e.uploadedBy||e.fuente||"—")}</div></div>
        <div class="info-item"><div class="info-label">Fecha</div><div class="info-value">${L(e.fecha,{withTime:!0})}</div></div>
        <div class="info-item"><div class="info-label">Tipo</div><div class="info-value">${c(e.mimeType||e.modalidad||"—")}</div></div>
      </div>
      <hr class="divider" style="margin:14px 0;" />
      <div class="info-item">
        <div class="info-label">Descripción / Notas</div>
        <div class="info-value">${c(e.descripcion||"Sin descripción.")}</div>
      </div>
      <div class="info-item" style="margin-top:10px;">
        <div class="info-label">Etiquetas</div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
          ${(e.tags||[]).map(s=>`<span class="badge badge-primary">${c(s)}</span>`).join("")||'<span class="text-tertiary">Sin etiquetas</span>'}
        </div>
      </div>
    `}),document.getElementById("btn-descargar-doc").addEventListener("click",()=>{if(!e.blob){u({message:"Este archivo es un dato de demostración sin contenido real para descargar.",tone:"warning"});return}j(e.blob,e.nombre)}),document.getElementById("btn-editar-doc").addEventListener("click",()=>_(e));const i=document.getElementById("replace-input");document.getElementById("btn-reemplazar-doc").addEventListener("click",()=>i.click()),i.addEventListener("change",async s=>{var $;const l=($=s.target.files)==null?void 0:$[0];l&&(await z("documentos",e.id,{blob:l,mimeType:l.type,sizeBytes:l.size,tamano:y(l.size),tipo:l.type.startsWith("image/")?"imagen":"documento",fecha:new Date().toISOString()}),u({message:"Archivo reemplazado correctamente.",tone:"success"}),m())}),document.getElementById("btn-compartir-doc").addEventListener("click",async()=>{const s=`${window.location.origin}${window.location.pathname}#/documentos?doc=${e.id}`;try{await navigator.clipboard.writeText(s),u({message:"Enlace copiado al portapapeles.",tone:"success"})}catch{u({message:s,duration:6e3})}}),document.getElementById("btn-imprimir-doc").addEventListener("click",()=>window.print()),document.getElementById("btn-eliminar-doc").addEventListener("click",async()=>{if(!confirm(`¿Eliminar "${e.nombre}"? Esta acción solo afecta los datos locales de la demo.`))return;const s=g.get(e.id);s&&(URL.revokeObjectURL(s.url),g.delete(e.id)),await R("documentos",e.id),o.selectedId=null,m()})}function _(e){const a=`
    <form id="form-editar-doc" class="form-grid">
      ${E({name:"nombre",label:"Nombre del archivo",value:e.nombre,required:!0,span2:!0})}
      ${T({name:"categoria",label:"Categoría",value:e.categoria,options:B})}
      ${E({name:"tags",label:"Etiquetas (separadas por coma)",value:(e.tags||[]).join(", "),span2:!0})}
      ${O({name:"descripcion",label:"Descripción",value:e.descripcion||"",span2:!0,rows:3})}
    </form>
  `;q({title:"Editar archivo",bodyHtml:a,footerHtml:`
      <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="modal-save">Guardar cambios</button>
    `,onMount:(t,d)=>{t.querySelector("#modal-cancel").addEventListener("click",d),t.querySelector("#modal-save").addEventListener("click",async()=>{const r=t.querySelector("#form-editar-doc");if(!U(r))return;const n=N(r);await z("documentos",e.id,{nombre:n.nombre,categoria:n.categoria,descripcion:n.descripcion||"",tags:n.tags?n.tags.split(",").map(i=>i.trim()).filter(Boolean):[]}),d(),u({message:"Archivo actualizado.",tone:"success"}),m()})}})}function ie(){x.forEach(e=>e()),x=[],P(),v=[]}export{te as mount,ie as unmount};
