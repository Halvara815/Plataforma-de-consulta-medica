import{s as g,g as d,i as c,l as h,d as y,e as f,h as b,b as x,j as $}from"./index-HXJRJ7id.js";import{m as l,c as p}from"./card-DyJCkSMh.js";let u=[];async function T(o){g("Reportes","Indicadores clínicos, productividad y estadísticas de la clínica");const i=d("pacientes"),t=d("consultas"),n=d("recetas"),e=d("citas"),s=d("estudios");o.innerHTML=`
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Reportes</h1>
          <p>Indicadores clínicos, productividad y estadísticas de la clínica (datos de demostración)</p>
        </div>
      </div>

      <div class="card-grid">
        ${l({label:"Consultas registradas",value:t.length,icon:c("stethoscope"),tone:"primary"})}
        ${l({label:"Pacientes activos",value:i.filter(a=>a.estado==="activo").length,icon:c("users"),tone:"accent"})}
        ${l({label:"Recetas emitidas",value:n.length,icon:c("pill"),tone:"success"})}
        ${l({label:"Estudios solicitados",value:s.length,icon:c("flask"),tone:"warning"})}
      </div>

      <div class="two-col">
        ${p({title:"Consultas por día",bodyHtml:'<div id="report-line"></div>'})}
        ${p({title:"Diagnósticos más frecuentes",bodyHtml:'<div id="report-donut" style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;"></div>'})}
      </div>

      <div class="two-col">
        ${p({title:"Citas por estado",bodyHtml:'<div id="report-estado-bars" class="stack" style="gap:10px;"></div>'})}
        ${p({title:"Consultas por médico",bodyHtml:'<div id="report-medico-bars" class="stack" style="gap:10px;"></div>'})}
      </div>
    </div>
  `,w(t),M(t),H(e),E(t)}function w(o){const i=document.getElementById("report-line"),t=new Map;o.forEach(s=>{const a=s.fecha.slice(0,10);t.set(a,(t.get(a)||0)+1)});const e=[...t.keys()].sort().map(s=>({label:s.slice(5),value:t.get(s)}));i.innerHTML=e.length?h({points:e,width:440,height:150}):'<div class="empty-state">Sin consultas registradas.</div>'}function M(o){const i=document.getElementById("report-donut"),t=new Map;o.forEach(a=>{a.diagnosticos.forEach(r=>t.set(r.descripcion,(t.get(r.descripcion)||0)+1))});const n=[...t.entries()].sort((a,r)=>r[1]-a[1]).map(([a,r])=>({label:a,value:r}));if(!n.length){i.innerHTML='<div class="empty-state">Sin diagnósticos registrados.</div>';return}const e=n.reduce((a,r)=>a+r.value,0),s=n.map((a,r)=>`
      <div style="display:flex; align-items:center; gap:8px; font-size:12.5px; margin-bottom:6px;">
        <span style="width:10px;height:10px;border-radius:50%;background:${y(r)};display:inline-block;"></span>
        <span style="flex:1;">${f(a.label)}</span>
        <span class="text-tertiary">${a.value} (${Math.round(a.value/e*100)}%)</span>
      </div>
    `).join("");i.innerHTML=`${b({segments:n})}<div style="flex:1; min-width:180px;">${s}</div>`}function v(o,i,t,n){const e=Math.max(...i.map(([,s])=>s),1);o.innerHTML=i.map(([s,a],r)=>{const m=Math.round(a/e*100);return`
        <div>
          <div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:4px;">
            <span>${n(s)}</span>
            <strong>${a}</strong>
          </div>
          <div style="height:8px; border-radius:var(--radius-full); background:var(--bg-surface-alt); overflow:hidden;">
            <div style="height:100%; width:${m}%; background:${t(r,s)}; border-radius:var(--radius-full);"></div>
          </div>
        </div>
      `}).join("")}function H(o){const i=document.getElementById("report-estado-bars"),t=new Map;o.forEach(e=>t.set(e.estado,(t.get(e.estado)||0)+1));const n=[...t.entries()].sort((e,s)=>s[1]-e[1]);if(!n.length){i.innerHTML='<div class="empty-state">Sin citas registradas.</div>';return}v(i,n,()=>"var(--color-primary)",x)}function E(o){const i=document.getElementById("report-medico-bars"),t=new Map;o.forEach(e=>t.set(e.medicoId,(t.get(e.medicoId)||0)+1));const n=[...t.entries()].sort((e,s)=>s[1]-e[1]);if(!n.length){i.innerHTML='<div class="empty-state">Sin consultas registradas.</div>';return}v(i,n,()=>"var(--color-accent)",e=>{var s;return((s=$("medicos",e))==null?void 0:s.nombre)||e})}function k(){u.forEach(o=>o()),u=[]}export{T as mount,k as unmount};
