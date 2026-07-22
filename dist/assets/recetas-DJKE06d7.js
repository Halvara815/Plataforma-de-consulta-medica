import{e as s,i as g,r as H,s as F,g as S,j as I,o as A,f as L,m as j}from"./index-HXJRJ7id.js";import{o as M}from"./modal-BHhV6Xsj.js";import{s as R,r as B,t as K,a as V,v as G,g as O}from"./form-xX5eYAiU.js";function J({columns:t,rows:o,searchableKeys:a=[],pageSize:r=8,onRowClick:e=null,rowKey:n="id",emptyMessage:l="No hay registros para mostrar.",searchPlaceholder:v="Buscar…",toolbarExtraHtml:y=""}){const u=document.createElement("div");u.className="table-wrapper";let i={rows:o,search:"",sortKey:null,sortDir:"asc",page:1};function x(){let d=i.rows;if(i.search&&a.length){const c=i.search.toLowerCase();d=d.filter(m=>a.some(b=>String(m[b]??"").toLowerCase().includes(c)))}return i.sortKey&&(d=[...d].sort((c,m)=>{const b=c[i.sortKey],h=m[i.sortKey];if(b===h)return 0;const w=b>h?1:-1;return i.sortDir==="asc"?w:-w})),d}function p(){const d=x(),c=Math.max(1,Math.ceil(d.length/r));i.page>c&&(i.page=c);const m=(i.page-1)*r,b=d.slice(m,m+r),h=t.map(f=>{const k=f.sortable?" sortable":"",$=i.sortKey===f.key?i.sortDir==="asc"?" ▲":" ▼":"";return`<th class="${k.trim()}" data-key="${f.key}" data-sortable="${!!f.sortable}">${s(f.label)}${$}</th>`}).join(""),w=b.length?b.map(f=>{const k=t.map($=>`<td>${$.render?$.render(f):s(f[$.key]??"")}</td>`).join("");return`<tr class="${e?"is-clickable":""}" data-row-id="${s(f[n])}">${k}</tr>`}).join(""):"";u.innerHTML=`
      <div class="table-toolbar">
        ${a.length?`<div class="table-search">
                ${g("search",{size:16})}
                <input type="search" placeholder="${s(v)}" value="${s(i.search)}" aria-label="${s(v)}" />
              </div>`:"<div></div>"}
        <div class="view-actions">${y}</div>
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr>${h}</tr></thead>
          <tbody>${w}</tbody>
        </table>
        ${b.length?"":`<div class="table-empty">${s(l)}</div>`}
      </div>
      <div class="table-pagination">
        <span>${d.length} registro(s) · página ${i.page} de ${c}</span>
        <div class="view-actions">
          <button type="button" class="btn btn-ghost btn-sm" data-page="prev" ${i.page<=1?"disabled":""}>‹ Anterior</button>
          <button type="button" class="btn btn-ghost btn-sm" data-page="next" ${i.page>=c?"disabled":""}>Siguiente ›</button>
        </div>
      </div>
    `,z()}const N=H(d=>{i.search=d,i.page=1,p()},200);function z(){const d=u.querySelector(".table-search input");d&&d.addEventListener("input",c=>N(c.target.value)),u.querySelectorAll('th[data-sortable="true"]').forEach(c=>{c.addEventListener("click",()=>{const m=c.dataset.key;i.sortKey===m?i.sortDir=i.sortDir==="asc"?"desc":"asc":(i.sortKey=m,i.sortDir="asc"),p()})}),u.querySelectorAll("[data-page]").forEach(c=>{c.addEventListener("click",()=>{i.page+=c.dataset.page==="next"?1:-1,p()})}),e&&u.querySelectorAll("tbody tr").forEach(c=>{c.addEventListener("click",()=>{const m=i.rows.find(b=>String(b[n])===c.dataset.rowId);m&&e(m)})})}return p(),{el:u,setRows(d){i.rows=d,i.page=1,p()}}}let q=[];async function Y(t,o={},a={}){F("Prescripciones / Farmacia","Emisión y control de recetas electrónicas"),t.innerHTML=`
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Recetas / Prescripción electrónica</h1>
          <p>Consulta el historial de recetas y emite nuevas prescripciones con validez legal.</p>
        </div>
        <div class="view-actions">
          <button type="button" class="btn btn-primary" id="btn-nueva-receta">${g("plus",{size:15})} Nueva receta</button>
        </div>
      </div>
      <div class="card" id="recetas-table-card"></div>
    </div>
  `,P(a.pacienteId),document.getElementById("btn-nueva-receta").addEventListener("click",()=>D(a.pacienteId)),a.action==="nueva"&&D(a.pacienteId)}function P(t){const o=document.getElementById("recetas-table-card");o.innerHTML="";let a=S("recetas");t&&(a=a.filter(n=>n.pacienteId===t)),a=[...a].sort((n,l)=>new Date(l.fecha)-new Date(n.fecha));const r=a.map(n=>{const l=I("pacientes",n.pacienteId);return{...n,pacienteNombre:l?`${l.nombre} ${l.apellidos}`:"Paciente no encontrado",medicamentosCount:n.medicamentos.length}}),e=J({columns:[{key:"folio",label:"Folio",sortable:!0},{key:"pacienteNombre",label:"Paciente",sortable:!0},{key:"fecha",label:"Fecha",sortable:!0,render:n=>L(n.fecha)},{key:"tipo",label:"Tipo",sortable:!0,render:n=>`<span class="badge">${s(n.tipo)}</span>`},{key:"medicamentosCount",label:"Medicamentos",sortable:!0},{key:"estado",label:"Estado",sortable:!0,render:n=>`<span class="badge ${n.estado==="activa"?"badge-success":"badge"}">${s(n.estado)}</span>`}],rows:r,searchableKeys:["folio","pacienteNombre"],searchPlaceholder:"Buscar por folio o paciente…",emptyMessage:"No hay recetas registradas todavía.",onRowClick:n=>Q(n)});o.appendChild(e.el)}function Q(t){const o=I("pacientes",t.pacienteId),a=I("medicos",t.medicoId),r=`
    <div class="stack">
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Paciente</div><div class="info-value">${s((o==null?void 0:o.nombre)||"")} ${s((o==null?void 0:o.apellidos)||"")}</div></div>
        <div class="info-item"><div class="info-label">Médico</div><div class="info-value">${s((a==null?void 0:a.nombre)||"")}</div></div>
        <div class="info-item"><div class="info-label">Fecha</div><div class="info-value">${L(t.fecha)}</div></div>
        <div class="info-item"><div class="info-label">Vigencia</div><div class="info-value">${t.vigenciaDias} días</div></div>
      </div>
      <hr class="divider" />
      <div class="stack" style="gap:10px;">
        ${t.medicamentos.map((e,n)=>`
          <div style="padding:10px; border:1px solid var(--border-color); border-radius:var(--radius-md);">
            <strong>${n+1}. ${s(e.nombre)} ${s(e.concentracion)}</strong>
            <div class="info-grid" style="margin-top:6px;">
              <div class="info-item"><div class="info-label">Dosis</div><div class="info-value">${s(e.dosis)}</div></div>
              <div class="info-item"><div class="info-label">Frecuencia</div><div class="info-value">${s(e.frecuencia)}</div></div>
              <div class="info-item"><div class="info-label">Duración</div><div class="info-value">${s(e.duracion)}</div></div>
              <div class="info-item"><div class="info-label">Vía</div><div class="info-value">${s(e.via)}</div></div>
            </div>
            ${e.indicaciones?`<div class="text-tertiary" style="font-size:12px; margin-top:6px;">${s(e.indicaciones)}</div>`:""}
          </div>
        `).join("")}
      </div>
      ${t.interacciones.length?`<div class="stack" style="gap:8px;">
              ${t.interacciones.map(e=>`<div class="badge badge-warning" style="display:flex; align-items:center; gap:6px; padding:10px; font-weight:400; font-size:12.5px;">${g("alert-triangle",{size:14})} ${s(e.descripcion)}</div>`).join("")}
            </div>`:""}
      ${t.notasPaciente?`<div class="info-item"><div class="info-label">Notas para el paciente</div><div class="info-value">${s(t.notasPaciente)}</div></div>`:""}
    </div>
  `;M({title:`Receta ${t.folio}`,bodyHtml:r,size:"lg",footerHtml:`
      <button type="button" class="btn btn-secondary" id="btn-print-receta">${g("printer",{size:14})} Imprimir</button>
      <button type="button" class="btn btn-primary" id="btn-close-receta">Cerrar</button>
    `,onMount:(e,n)=>{e.querySelector("#btn-close-receta").addEventListener("click",n),e.querySelector("#btn-print-receta").addEventListener("click",()=>window.print())}})}function D(t){const o=S("pacientes"),a=A(),r=`
    <form id="form-nueva-receta" class="stack">
      <div class="form-grid">
        ${R({name:"pacienteId",label:"Paciente",required:!0,span2:!0,value:t||"",options:o.map(e=>({value:e.id,label:`${e.nombre} ${e.apellidos}`}))})}
        ${B({name:"tipo",label:"Tipo de receta",value:"ambulatoria",options:[{value:"ambulatoria",label:"Ambulatoria"},{value:"controlado",label:"Controlado"},{value:"especial",label:"Especial"}]})}
        ${K({name:"vigenciaDias",label:"Vigencia (días)",type:"number",value:"5",required:!0})}
      </div>
      <div class="card-header" style="margin-top:8px;">
        <h3>Medicamentos</h3>
        <button type="button" class="btn btn-secondary btn-sm" id="btn-agregar-medicamento">${g("plus",{size:14})} Agregar medicamento</button>
      </div>
      <div id="medicamentos-rows" class="stack" style="gap:10px;"></div>
      <div id="interacciones-preview"></div>
      ${V({name:"notasPaciente",label:"Notas adicionales (para el paciente)",span2:!0,rows:2})}
    </form>
  `;M({title:"Nueva receta",bodyHtml:r,size:"lg",footerHtml:`
      <button type="button" class="btn btn-secondary" id="modal-cancel">Cancelar</button>
      <button type="button" class="btn btn-primary" id="modal-save">Guardar y cerrar</button>
    `,onMount:(e,n)=>{const l=e.querySelector("#medicamentos-rows");E(l,a),e.querySelector("#btn-agregar-medicamento").addEventListener("click",()=>{E(l,a)}),l.addEventListener("click",v=>{v.target.matches("[data-remove-row]")&&(v.target.closest(".medicamento-row").remove(),C(e,a))}),l.addEventListener("change",()=>C(e,a)),e.querySelector("#modal-cancel").addEventListener("click",n),e.querySelector("#modal-save").addEventListener("click",async()=>{const v=e.querySelector("#form-nueva-receta");if(!G(v))return;const y=[...l.querySelectorAll(".medicamento-row")].map(p=>({nombre:p.querySelector('[name="med-nombre"]').value,concentracion:p.querySelector('[name="med-concentracion"]').value,dosis:p.querySelector('[name="med-dosis"]').value||"1 tableta",frecuencia:p.querySelector('[name="med-frecuencia"]').value||"Cada 24 h",duracion:p.querySelector('[name="med-duracion"]').value||"5 días",via:p.querySelector('[name="med-via"]').value,indicaciones:p.querySelector('[name="med-indicaciones"]').value}));if(!y.length){alert("Agrega al menos un medicamento a la receta.");return}const u=O(v),i=T(y,a),x=4600+S("recetas").length;await j("recetas",{folio:`REC-${String(x).padStart(7,"0")}`,pacienteId:u.pacienteId,medicoId:"MED-0001",fecha:new Date().toISOString().slice(0,10),tipo:u.tipo,vigenciaDias:parseInt(u.vigenciaDias,10)||5,medicamentos:y,interacciones:i,notasPaciente:u.notasPaciente||"",firma:{medico:"Dr. Carlos Pérez",cedula:"12345678"},estado:"activa"}),n(),P(t)})}})}function E(t,o){var r;const a=document.createElement("div");a.className="medicamento-row",a.style.cssText="padding:12px; border:1px solid var(--border-color); border-radius:var(--radius-md); position:relative;",a.innerHTML=`
    <button type="button" data-remove-row class="btn btn-ghost btn-sm" style="position:absolute; top:8px; right:8px;">${g("x",{size:14})}</button>
    <div class="form-grid">
      <div class="form-field span-2">
        <label>Medicamento</label>
        <select class="input" name="med-nombre">
          ${o.medicamentos.map(e=>`<option value="${s(e.nombre)}">${s(e.nombre)}</option>`).join("")}
        </select>
      </div>
      <div class="form-field">
        <label>Concentración</label>
        <input class="input" name="med-concentracion" value="${s(((r=o.medicamentos[0])==null?void 0:r.presentaciones[0])||"")}" />
      </div>
      <div class="form-field">
        <label>Dosis</label>
        <input class="input" name="med-dosis" value="1 tableta" />
      </div>
      <div class="form-field">
        <label>Frecuencia</label>
        <input class="input" name="med-frecuencia" value="Cada 24 h" />
      </div>
      <div class="form-field">
        <label>Duración</label>
        <input class="input" name="med-duracion" value="5 días" />
      </div>
      <div class="form-field">
        <label>Vía</label>
        <select class="input" name="med-via">
          <option>Oral</option>
          <option>Tópica</option>
          <option>Inyectable</option>
          <option>Inhalada</option>
        </select>
      </div>
      <div class="form-field span-2">
        <label>Indicaciones</label>
        <input class="input" name="med-indicaciones" placeholder="Ej. Tomar con alimentos" />
      </div>
    </div>
  `,t.appendChild(a)}function T(t,o){const a=t.map(r=>r.nombre);return o.interaccionesConocidas.filter(r=>r.medicamentos.every(e=>a.includes(e)))}function C(t,o){const a=t.querySelector("#medicamentos-rows"),r=t.querySelector("#interacciones-preview"),n=[...a.querySelectorAll('[name="med-nombre"]')].map(v=>v.value).map(v=>({nombre:v})),l=T(n,o);r.innerHTML=l.length?l.map(v=>`<div class="badge badge-warning" style="display:flex; align-items:center; gap:6px; padding:10px; font-weight:400; font-size:12.5px; margin-bottom:6px;">${g("alert-triangle",{size:14})} Interacción detectada: ${s(v.descripcion)}</div>`).join(""):""}function Z(){q.forEach(t=>t()),q=[]}export{Y as mount,Z as unmount};
