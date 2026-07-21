import{j as b,s as E,o as w,c as S,e as l,k as F,i as T,n as y,m as M,p as $}from"./index-CfR6KO86.js";import{t as n,a as r,v as P,g as D}from"./form-L0qYvfTg.js";let u=[],m=null;async function N(s,o={}){const a=b("pacientes",o.id);if(!a){s.innerHTML='<div class="empty-state">Paciente no encontrado.</div>';return}E("Consulta médica",`${a.nombre} ${a.apellidos}`);const i=w(),c=b("medicos","MED-0001"),d=Date.now();s.innerHTML=`
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Consulta médica</h1>
          <p>Registro de la consulta activa</p>
        </div>
      </div>

      <div class="card">
        <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
          <span class="avatar-initials" style="width:56px;height:56px;font-size:18px;">${S(a.nombre+" "+a.apellidos)}</span>
          <div style="flex:1; min-width:220px;">
            <h2 style="font-size:17px;">${l(a.nombre)} ${l(a.apellidos)}</h2>
            <div class="text-tertiary" style="font-size:12.5px;">${F(a.fechaNacimiento)} años · ${l(a.sexo)} · Grupo ${l(a.grupoSanguineo)}</div>
          </div>
          <div style="text-align:right;">
            <div class="text-tertiary" style="font-size:11.5px;">Duración</div>
            <strong id="consulta-timer" style="font-size:16px;">00:00:00</strong>
          </div>
        </div>
      </div>

      <form id="form-consulta" class="stack">
        <div class="card">
          <div class="card-header"><h2>Motivo y padecimiento actual</h2></div>
          <div class="form-grid">
            ${n({name:"motivoConsulta",label:"Motivo de consulta",required:!0,span2:!0,placeholder:"Ej. Consulta de seguimiento"})}
            ${r({name:"padecimientoActual",label:"Padecimiento actual",span2:!0,rows:3})}
            ${n({name:"sintomas",label:"Síntomas (separados por coma)",span2:!0,placeholder:"Cefalea, mareo leve, cansancio"})}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h2>Signos vitales</h2></div>
          <div class="form-grid">
            ${n({name:"ta",label:"TA (mmHg)",placeholder:"120/80"})}
            ${n({name:"fc",label:"FC (lpm)",type:"number"})}
            ${n({name:"fr",label:"FR (rpm)",type:"number"})}
            ${n({name:"temp",label:"Temp. (°C)",type:"number"})}
            ${n({name:"spo2",label:"SpO₂ (%)",type:"number"})}
            ${n({name:"peso",label:"Peso (kg)",type:"number"})}
            ${n({name:"talla",label:"Talla (cm)",type:"number"})}
            <div class="form-field">
              <label>IMC calculado</label>
              <div class="input" id="consulta-imc-display" style="background:var(--bg-surface-alt);">—</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h2>Exploración física y antecedentes</h2></div>
          <div class="form-grid">
            ${r({name:"exploracionFisica",label:"Exploración física",span2:!0,rows:3})}
            ${r({name:"heredofamiliares",label:"Antecedentes heredofamiliares",span2:!0,rows:2})}
            ${r({name:"personalesPatologicos",label:"Antecedentes personales patológicos",span2:!0,rows:2})}
            ${r({name:"personalesNoPatologicos",label:"Antecedentes personales no patológicos",span2:!0,rows:2})}
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h2>Diagnóstico (CIE-10)</h2></div>
          <div class="form-grid">
            <div class="form-field span-2">
              <label for="f-diagnosticos">Selecciona uno o más diagnósticos</label>
              <select class="input" id="f-diagnosticos" name="diagnosticos" multiple size="6">
                ${i.diagnosticosCIE10.map(t=>`<option value="${l(t.codigo)}|${l(t.descripcion)}">${l(t.codigo)} · ${l(t.descripcion)}</option>`).join("")}
              </select>
              <span class="hint">Mantén Ctrl (Cmd en Mac) para seleccionar varios.</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h2>Plan terapéutico y notas</h2></div>
          <div class="form-grid">
            ${r({name:"planTerapeutico",label:"Plan terapéutico (una indicación por línea)",span2:!0,rows:4,placeholder:`Losartán 50 mg VO cada 24 horas.
Dieta hiposódica.`})}
            ${r({name:"notas",label:"Notas adicionales",span2:!0,rows:2})}
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="btn-cancelar-consulta">Cancelar</button>
          <button type="submit" class="btn btn-primary" id="btn-guardar-consulta">${T("check",{size:15})} Guardar consulta</button>
        </div>
      </form>
    </div>
  `,B(),L(d),document.getElementById("btn-cancelar-consulta").addEventListener("click",()=>{y(`#/historia-clinica/${a.id}`)}),document.getElementById("form-consulta").addEventListener("submit",async t=>{var h;t.preventDefault();const v=t.target;if(!P(v))return;const e=D(v),x=[...document.getElementById("f-diagnosticos").selectedOptions].map(p=>{const[I,C]=p.value.split("|");return{cie10:I,descripcion:C,tipo:"definitivo"}}),g=parseFloat(e.peso)||null,f=parseFloat(e.talla)||null;await M("consultas",{pacienteId:a.id,medicoId:(c==null?void 0:c.id)||"MED-0001",fecha:new Date().toISOString(),tipo:"seguimiento",motivoConsulta:e.motivoConsulta,padecimientoActual:e.padecimientoActual||"",sintomas:e.sintomas?e.sintomas.split(",").map(p=>p.trim()).filter(Boolean):[],signosVitales:{ta:e.ta||"",fc:parseInt(e.fc,10)||null,fr:parseInt(e.fr,10)||null,temp:parseFloat(e.temp)||null,spo2:parseInt(e.spo2,10)||null,peso:g,talla:f,imc:$(g,f)},exploracionFisica:e.exploracionFisica||"",antecedentes:{heredofamiliares:e.heredofamiliares||"",personalesPatologicos:e.personalesPatologicos||"",personalesNoPatologicos:e.personalesNoPatologicos||""},diagnosticos:x,planTerapeutico:e.planTerapeutico?e.planTerapeutico.split(`
`).map(p=>p.trim()).filter(Boolean):[],notas:e.notas||"",duracion:((h=document.getElementById("consulta-timer"))==null?void 0:h.textContent)||"00:00:00",estado:"completada"}),y(`#/historia-clinica/${a.id}`)})}function B(){const s=document.querySelector('[name="peso"]'),o=document.querySelector('[name="talla"]'),a=document.getElementById("consulta-imc-display");function i(){const c=parseFloat(s.value),d=parseFloat(o.value),t=$(c,d);a.textContent=t?`${t} kg/m²`:"—"}s.addEventListener("input",i),o.addEventListener("input",i),u.push(()=>{s.removeEventListener("input",i),o.removeEventListener("input",i)})}function L(s){const o=document.getElementById("consulta-timer");function a(){const i=Math.floor((Date.now()-s)/1e3),c=String(Math.floor(i/3600)).padStart(2,"0"),d=String(Math.floor(i%3600/60)).padStart(2,"0"),t=String(i%60).padStart(2,"0");o&&(o.textContent=`${c}:${d}:${t}`)}a(),m=setInterval(a,1e3)}function q(){u.forEach(s=>s()),u=[],m&&(clearInterval(m),m=null)}export{N as mount,q as unmount};
