import{s as m,g as d,l as g,c as h,e as y,d as f,b,h as x}from"./index-BbYPTjK5.js";import{m as c,c as l}from"./card-CijOLgPO.js";let p=[];async function C(o){m("Reportes","Indicadores clínicos, productividad y estadísticas de la clínica");const i=d("pacientes"),t=d("consultas"),n=d("recetas"),e=d("citas"),s=d("estudios");o.innerHTML=`
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Reportes</h1>
          <p>Indicadores clínicos, productividad y estadísticas de la clínica (datos de demostración)</p>
        </div>
      </div>

      <div class="card-grid">
        ${c({label:"Consultas registradas",value:t.length,icon:"🩺",tone:"primary"})}
        ${c({label:"Pacientes activos",value:i.filter(a=>a.estado==="activo").length,icon:"🧑‍⚕️",tone:"accent"})}
        ${c({label:"Recetas emitidas",value:n.length,icon:"💊",tone:"success"})}
        ${c({label:"Estudios solicitados",value:s.length,icon:"🧪",tone:"warning"})}
      </div>

      <div class="two-col">
        ${l({title:"Consultas por día",bodyHtml:'<div id="report-line"></div>'})}
        ${l({title:"Diagnósticos más frecuentes",bodyHtml:'<div id="report-donut" style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;"></div>'})}
      </div>

      <div class="two-col">
        ${l({title:"Citas por estado",bodyHtml:'<div id="report-estado-bars" class="stack" style="gap:10px;"></div>'})}
        ${l({title:"Consultas por médico",bodyHtml:'<div id="report-medico-bars" class="stack" style="gap:10px;"></div>'})}
      </div>
    </div>
  `,$(t),w(t),M(e),H(t)}function $(o){const i=document.getElementById("report-line"),t=new Map;o.forEach(s=>{const a=s.fecha.slice(0,10);t.set(a,(t.get(a)||0)+1)});const e=[...t.keys()].sort().map(s=>({label:s.slice(5),value:t.get(s)}));i.innerHTML=e.length?g({points:e,width:440,height:150}):'<div class="empty-state">Sin consultas registradas.</div>'}function w(o){const i=document.getElementById("report-donut"),t=new Map;o.forEach(a=>{a.diagnosticos.forEach(r=>t.set(r.descripcion,(t.get(r.descripcion)||0)+1))});const n=[...t.entries()].sort((a,r)=>r[1]-a[1]).map(([a,r])=>({label:a,value:r}));if(!n.length){i.innerHTML='<div class="empty-state">Sin diagnósticos registrados.</div>';return}const e=n.reduce((a,r)=>a+r.value,0),s=n.map((a,r)=>`
      <div style="display:flex; align-items:center; gap:8px; font-size:12.5px; margin-bottom:6px;">
        <span style="width:10px;height:10px;border-radius:50%;background:${h(r)};display:inline-block;"></span>
        <span style="flex:1;">${y(a.label)}</span>
        <span class="text-tertiary">${a.value} (${Math.round(a.value/e*100)}%)</span>
      </div>
    `).join("");i.innerHTML=`${f({segments:n})}<div style="flex:1; min-width:180px;">${s}</div>`}function u(o,i,t,n){const e=Math.max(...i.map(([,s])=>s),1);o.innerHTML=i.map(([s,a],r)=>{const v=Math.round(a/e*100);return`
        <div>
          <div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:4px;">
            <span>${n(s)}</span>
            <strong>${a}</strong>
          </div>
          <div style="height:8px; border-radius:var(--radius-full); background:var(--bg-surface-alt); overflow:hidden;">
            <div style="height:100%; width:${v}%; background:${t(r,s)}; border-radius:var(--radius-full);"></div>
          </div>
        </div>
      `}).join("")}function M(o){const i=document.getElementById("report-estado-bars"),t=new Map;o.forEach(e=>t.set(e.estado,(t.get(e.estado)||0)+1));const n=[...t.entries()].sort((e,s)=>s[1]-e[1]);if(!n.length){i.innerHTML='<div class="empty-state">Sin citas registradas.</div>';return}u(i,n,()=>"var(--color-primary)",b)}function H(o){const i=document.getElementById("report-medico-bars"),t=new Map;o.forEach(e=>t.set(e.medicoId,(t.get(e.medicoId)||0)+1));const n=[...t.entries()].sort((e,s)=>s[1]-e[1]);if(!n.length){i.innerHTML='<div class="empty-state">Sin consultas registradas.</div>';return}u(i,n,()=>"var(--color-accent)",e=>{var s;return((s=x("medicos",e))==null?void 0:s.nombre)||e})}function T(){p.forEach(o=>o()),p=[]}export{C as mount,T as unmount};
