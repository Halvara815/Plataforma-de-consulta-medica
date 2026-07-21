import{s as w,g as p,i as r,e as d,a as H,b as L,f as E,c as I,l as M,d as T,h as z,n as D}from"./index-CfR6KO86.js";import{m as u,c as v}from"./card-BvYCVBXz.js";const f="2026-07-20",S=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];let y=[];async function N(o){w("Panel General","Resumen de la actividad clínica de hoy");const a=p("pacientes"),t=p("citas"),s=p("consultas"),n=p("recetas"),l=p("estudios"),e=t.filter(c=>c.fecha===f).sort((c,g)=>c.horaInicio.localeCompare(g.horaInicio)),i=e.find(c=>c.pacienteId),m=a.filter(c=>c.estado==="activo"),h=a.flatMap(c=>c.alertas.map(g=>({...g,paciente:c}))).filter(c=>c.activa),x=l.filter(c=>c.estado!=="completado"),$=Object.fromEntries(a.map(c=>[c.id,c]));o.innerHTML=`
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Panel General</h1>
          <p>Resumen de la actividad clínica de hoy</p>
        </div>
      </div>

      <div class="card-grid">
        ${u({label:"Citas de hoy",value:e.length,icon:r("calendar"),trend:i?`Próxima: ${i.horaInicio}`:"Sin citas próximas",tone:"primary"})}
        ${u({label:"Pacientes activos",value:m.length,icon:r("users"),trend:`${a.length} en total`,tone:"accent"})}
        ${u({label:"Seguimientos pendientes",value:h.length,icon:r("clipboard-list"),trend:`${x.length} estudio(s) en proceso`,tone:"warning"})}
        ${u({label:"Recetas emitidas",value:n.length,icon:r("pill"),trend:"Acumulado de la demo",tone:"success"})}
        ${u({label:"Alertas clínicas",value:h.length+x.length,icon:r("alert-triangle"),trend:"Requieren atención",tone:"danger"})}
      </div>

      <div class="two-col">
        <div class="stack">
          ${v({title:"Agenda de hoy",actionsHtml:'<a href="#/agenda" class="btn btn-ghost btn-sm">Ver agenda completa</a>',bodyHtml:'<div id="dash-agenda-list" class="stack"></div>'})}
          ${v({title:"Consultas esta semana",bodyHtml:'<div id="dash-line-chart"></div>'})}
        </div>
        <div class="stack">
          ${v({title:"Pacientes recientes",actionsHtml:'<a href="#/pacientes" class="btn btn-ghost btn-sm">Ver todos</a>',bodyHtml:'<div id="dash-pacientes-list" class="stack"></div>'})}
          ${v({title:"Seguimientos pendientes",bodyHtml:'<div id="dash-seguimientos-list" class="stack"></div>'})}
          ${v({title:"Diagnósticos más frecuentes",bodyHtml:'<div id="dash-donut" style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;"></div>'})}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h2>Acciones rápidas</h2></div>
        <div class="card-grid">
          <button type="button" class="btn btn-secondary" data-action="nuevo-paciente">${r("plus",{size:15})} Nuevo paciente</button>
          <button type="button" class="btn btn-secondary" data-action="nueva-consulta">${r("stethoscope",{size:15})} Nueva consulta</button>
          <button type="button" class="btn btn-secondary" data-action="receta">${r("pill",{size:15})} Receta</button>
          <button type="button" class="btn btn-secondary" data-action="documento">${r("upload",{size:15})} Subir documento</button>
        </div>
      </div>
    </div>
  `,A(e,$),k(a,t),C(h),R(s),j(s),B(o)}function A(o,a){const t=document.getElementById("dash-agenda-list");if(!t)return;const s=o.slice(0,6);if(!s.length){t.innerHTML='<div class="empty-state">No hay citas programadas para hoy.</div>';return}t.innerHTML=s.map(n=>{const l=n.pacienteId?a[n.pacienteId]:null,e=l?`${l.nombre} ${l.apellidos}`:n.motivo;return`
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 0; border-bottom:1px solid var(--border-color);">
          <div style="display:flex; align-items:center; gap:12px; min-width:0;">
            <strong style="font-size:12.5px; color:var(--text-secondary); min-width:44px;">${n.horaInicio}</strong>
            <div style="min-width:0;">
              <div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${d(e)}</div>
              <div class="text-tertiary" style="font-size:11.5px;">${d(l?n.motivo:"")}</div>
            </div>
          </div>
          <span class="badge ${H(n.estado)}">${L(n.estado)}</span>
        </div>
      `}).join("")}function k(o,a){const t=document.getElementById("dash-pacientes-list");if(!t)return;const s=[...o].sort((n,l)=>new Date(l.fechaRegistro)-new Date(n.fechaRegistro)).slice(0,5);t.innerHTML=s.map(n=>{const l=a.find(i=>i.pacienteId===n.id&&i.fecha===f),e=l?`Hoy, ${l.horaInicio} · ${l.motivo}`:`Registrado ${E(n.fechaRegistro)}`;return`
        <a href="#/pacientes/${n.id}" style="display:flex; align-items:center; gap:12px; padding:6px 0; text-decoration:none; color:inherit;">
          <span class="avatar-initials" style="width:38px;height:38px;">${I(n.nombre+" "+n.apellidos)}</span>
          <div style="min-width:0;">
            <div style="font-size:13px; font-weight:600;">${d(n.nombre)} ${d(n.apellidos)}</div>
            <div class="text-tertiary" style="font-size:11.5px;">${d(e)}</div>
          </div>
        </a>
      `}).join("")}function C(o){const a=document.getElementById("dash-seguimientos-list");if(a){if(!o.length){a.innerHTML='<div class="empty-state">Sin seguimientos pendientes.</div>';return}a.innerHTML=o.slice(0,5).map(t=>`
        <a href="#/historia-clinica/${t.paciente.id}" style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; text-decoration:none; color:inherit;">
          <div>
            <div style="font-size:13px; font-weight:600;">${d(t.paciente.nombre)} ${d(t.paciente.apellidos)}</div>
            <div class="text-tertiary" style="font-size:11.5px;">${d(t.tipo)}</div>
          </div>
          <span class="badge badge-warning">${d(t.descripcion)}</span>
        </a>
      `).join("")}}function R(o){const a=document.getElementById("dash-line-chart");if(!a)return;const t=new Date(`${f}T00:00:00`),s=[];for(let e=6;e>=0;e--){const i=new Date(t);i.setDate(i.getDate()-e),s.push(i)}const n=s.map(e=>{const i=e.toISOString().slice(0,10),m=o.filter(b=>b.fecha.slice(0,10)===i).length;return{label:S[e.getDay()],value:m}}),l=n.reduce((e,i)=>e+i.value,0);a.innerHTML=`
    ${M({points:n,width:440,height:140})}
    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:8px;">
      <strong style="font-size:22px;">${l}</strong>
      <span class="text-tertiary" style="font-size:12px;">Total de consultas (últimos 7 días de la demo)</span>
    </div>
  `}function j(o){const a=document.getElementById("dash-donut");if(!a)return;const t=new Map;o.forEach(e=>{e.diagnosticos.forEach(i=>{t.set(i.descripcion,(t.get(i.descripcion)||0)+1)})});const s=[...t.entries()].sort((e,i)=>i[1]-e[1]).map(([e,i])=>({label:e,value:i}));if(!s.length){a.innerHTML='<div class="empty-state">Sin diagnósticos registrados.</div>';return}const n=s.reduce((e,i)=>e+i.value,0),l=s.map((e,i)=>`
        <div style="display:flex; align-items:center; gap:8px; font-size:12.5px; margin-bottom:6px;">
          <span style="width:10px;height:10px;border-radius:50%;background:${T(i)};display:inline-block;"></span>
          <span style="flex:1;">${d(e.label)}</span>
          <span class="text-tertiary">${e.value} (${Math.round(e.value/n*100)}%)</span>
        </div>
      `).join("");a.innerHTML=`
    ${z({segments:s})}
    <div style="flex:1; min-width:180px;">${l}</div>
  `}function B(o){const a={"nuevo-paciente":"#/pacientes?action=nuevo","nueva-consulta":"#/pacientes?action=consulta",receta:"#/recetas?action=nueva",documento:"#/documentos?action=subir"};o.querySelectorAll("[data-action]").forEach(t=>{const s=()=>D(a[t.dataset.action]);t.addEventListener("click",s),y.push(()=>t.removeEventListener("click",s))})}function V(){y.forEach(o=>o()),y=[]}export{N as mount,V as unmount};
