import{s as $,g as r,e as l,a as w,b as H,f as L,i as E,l as I,c as M,d as T,n as D}from"./index-BbYPTjK5.js";import{m as p,c as u}from"./card-CijOLgPO.js";const y="2026-07-20",S=["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];let g=[];async function O(o){$("Panel General","Resumen de la actividad clínica de hoy");const a=r("pacientes"),t=r("citas"),s=r("consultas"),n=r("recetas"),d=r("estudios"),e=t.filter(c=>c.fecha===y).sort((c,h)=>c.horaInicio.localeCompare(h.horaInicio)),i=e.find(c=>c.pacienteId),v=a.filter(c=>c.estado==="activo"),m=a.flatMap(c=>c.alertas.map(h=>({...h,paciente:c}))).filter(c=>c.activa),b=d.filter(c=>c.estado!=="completado"),x=Object.fromEntries(a.map(c=>[c.id,c]));o.innerHTML=`
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Panel General</h1>
          <p>Resumen de la actividad clínica de hoy</p>
        </div>
      </div>

      <div class="card-grid">
        ${p({label:"Citas de hoy",value:e.length,icon:"📅",trend:i?`Próxima: ${i.horaInicio}`:"Sin citas próximas",tone:"primary"})}
        ${p({label:"Pacientes activos",value:v.length,icon:"🧑‍⚕️",trend:`${a.length} en total`,tone:"accent"})}
        ${p({label:"Seguimientos pendientes",value:m.length,icon:"📋",trend:`${b.length} estudio(s) en proceso`,tone:"warning"})}
        ${p({label:"Recetas emitidas",value:n.length,icon:"💊",trend:"Acumulado de la demo",tone:"success"})}
        ${p({label:"Alertas clínicas",value:m.length+b.length,icon:"⚠️",trend:"Requieren atención",tone:"danger"})}
      </div>

      <div class="two-col">
        <div class="stack">
          ${u({title:"Agenda de hoy",actionsHtml:'<a href="#/agenda" class="btn btn-ghost btn-sm">Ver agenda completa</a>',bodyHtml:'<div id="dash-agenda-list" class="stack"></div>'})}
          ${u({title:"Consultas esta semana",bodyHtml:'<div id="dash-line-chart"></div>'})}
        </div>
        <div class="stack">
          ${u({title:"Pacientes recientes",actionsHtml:'<a href="#/pacientes" class="btn btn-ghost btn-sm">Ver todos</a>',bodyHtml:'<div id="dash-pacientes-list" class="stack"></div>'})}
          ${u({title:"Seguimientos pendientes",bodyHtml:'<div id="dash-seguimientos-list" class="stack"></div>'})}
          ${u({title:"Diagnósticos más frecuentes",bodyHtml:'<div id="dash-donut" style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;"></div>'})}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h2>Acciones rápidas</h2></div>
        <div class="card-grid">
          <button type="button" class="btn btn-secondary" data-action="nuevo-paciente">➕ Nuevo paciente</button>
          <button type="button" class="btn btn-secondary" data-action="nueva-consulta">🩺 Nueva consulta</button>
          <button type="button" class="btn btn-secondary" data-action="receta">💊 Receta</button>
          <button type="button" class="btn btn-secondary" data-action="documento">📤 Subir documento</button>
        </div>
      </div>
    </div>
  `,A(e,x),k(a,t),z(m),C(s),R(s),j(o)}function A(o,a){const t=document.getElementById("dash-agenda-list");if(!t)return;const s=o.slice(0,6);if(!s.length){t.innerHTML='<div class="empty-state">No hay citas programadas para hoy.</div>';return}t.innerHTML=s.map(n=>{const d=n.pacienteId?a[n.pacienteId]:null,e=d?`${d.nombre} ${d.apellidos}`:n.motivo;return`
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 0; border-bottom:1px solid var(--border-color);">
          <div style="display:flex; align-items:center; gap:12px; min-width:0;">
            <strong style="font-size:12.5px; color:var(--text-secondary); min-width:44px;">${n.horaInicio}</strong>
            <div style="min-width:0;">
              <div style="font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${l(e)}</div>
              <div class="text-tertiary" style="font-size:11.5px;">${l(d?n.motivo:"")}</div>
            </div>
          </div>
          <span class="badge ${w(n.estado)}">${H(n.estado)}</span>
        </div>
      `}).join("")}function k(o,a){const t=document.getElementById("dash-pacientes-list");if(!t)return;const s=[...o].sort((n,d)=>new Date(d.fechaRegistro)-new Date(n.fechaRegistro)).slice(0,5);t.innerHTML=s.map(n=>{const d=a.find(i=>i.pacienteId===n.id&&i.fecha===y),e=d?`Hoy, ${d.horaInicio} · ${d.motivo}`:`Registrado ${L(n.fechaRegistro)}`;return`
        <a href="#/pacientes/${n.id}" style="display:flex; align-items:center; gap:12px; padding:6px 0; text-decoration:none; color:inherit;">
          <span class="avatar-initials" style="width:38px;height:38px;">${E(n.nombre+" "+n.apellidos)}</span>
          <div style="min-width:0;">
            <div style="font-size:13px; font-weight:600;">${l(n.nombre)} ${l(n.apellidos)}</div>
            <div class="text-tertiary" style="font-size:11.5px;">${l(e)}</div>
          </div>
        </a>
      `}).join("")}function z(o){const a=document.getElementById("dash-seguimientos-list");if(a){if(!o.length){a.innerHTML='<div class="empty-state">Sin seguimientos pendientes.</div>';return}a.innerHTML=o.slice(0,5).map(t=>`
        <a href="#/historia-clinica/${t.paciente.id}" style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; text-decoration:none; color:inherit;">
          <div>
            <div style="font-size:13px; font-weight:600;">${l(t.paciente.nombre)} ${l(t.paciente.apellidos)}</div>
            <div class="text-tertiary" style="font-size:11.5px;">${l(t.tipo)}</div>
          </div>
          <span class="badge badge-warning">${l(t.descripcion)}</span>
        </a>
      `).join("")}}function C(o){const a=document.getElementById("dash-line-chart");if(!a)return;const t=new Date(`${y}T00:00:00`),s=[];for(let e=6;e>=0;e--){const i=new Date(t);i.setDate(i.getDate()-e),s.push(i)}const n=s.map(e=>{const i=e.toISOString().slice(0,10),v=o.filter(f=>f.fecha.slice(0,10)===i).length;return{label:S[e.getDay()],value:v}}),d=n.reduce((e,i)=>e+i.value,0);a.innerHTML=`
    ${I({points:n,width:440,height:140})}
    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-top:8px;">
      <strong style="font-size:22px;">${d}</strong>
      <span class="text-tertiary" style="font-size:12px;">Total de consultas (últimos 7 días de la demo)</span>
    </div>
  `}function R(o){const a=document.getElementById("dash-donut");if(!a)return;const t=new Map;o.forEach(e=>{e.diagnosticos.forEach(i=>{t.set(i.descripcion,(t.get(i.descripcion)||0)+1)})});const s=[...t.entries()].sort((e,i)=>i[1]-e[1]).map(([e,i])=>({label:e,value:i}));if(!s.length){a.innerHTML='<div class="empty-state">Sin diagnósticos registrados.</div>';return}const n=s.reduce((e,i)=>e+i.value,0),d=s.map((e,i)=>`
        <div style="display:flex; align-items:center; gap:8px; font-size:12.5px; margin-bottom:6px;">
          <span style="width:10px;height:10px;border-radius:50%;background:${M(i)};display:inline-block;"></span>
          <span style="flex:1;">${l(e.label)}</span>
          <span class="text-tertiary">${e.value} (${Math.round(e.value/n*100)}%)</span>
        </div>
      `).join("");a.innerHTML=`
    ${T({segments:s})}
    <div style="flex:1; min-width:180px;">${d}</div>
  `}function j(o){const a={"nuevo-paciente":"#/pacientes?action=nuevo","nueva-consulta":"#/pacientes?action=consulta",receta:"#/recetas?action=nueva",documento:"#/documentos?action=subir"};o.querySelectorAll("[data-action]").forEach(t=>{const s=()=>D(a[t.dataset.action]);t.addEventListener("click",s),g.push(()=>t.removeEventListener("click",s))})}function N(){g.forEach(o=>o()),g=[]}export{O as mount,N as unmount};
