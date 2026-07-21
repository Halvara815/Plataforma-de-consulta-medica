import{s as u,t as m,A as v,B as f,i as r,C as b,D as g,S as y,E as x,F as h}from"./index-DOxX59Tn.js";import{c as d}from"./card-Bj6da6jR.js";let c=[];async function $(s){u("Configuración","Preferencias de interfaz, respaldo local y datos de la demo");const{currentUser:a}=m.getState(),p=v();s.innerHTML=`
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Configuración</h1>
          <p>Preferencias de interfaz, respaldo local y datos de la demo</p>
        </div>
      </div>

      <div class="two-col">
        <div class="stack">
          ${d({title:"Apariencia",bodyHtml:`
              <div class="radio-group" id="theme-options" style="flex-direction:column; align-items:flex-start; gap:10px;">
                ${[{value:"light",label:"Claro"},{value:"dark",label:"Oscuro"},{value:"system",label:"Automático (según el sistema)"}].map(e=>`
                    <label class="radio-option">
                      <input type="radio" name="theme" value="${e.value}" ${p===e.value?"checked":""} />
                      ${e.label}
                    </label>
                  `).join("")}
              </div>
              <p class="text-tertiary" style="font-size:12px; margin-top:10px;">Esta preferencia se guarda en localStorage de tu navegador (solo afecta la interfaz).</p>
            `})}

          ${d({title:"Perfil del médico (demo)",bodyHtml:`
              <div class="info-grid">
                <div class="info-item"><div class="info-label">Nombre</div><div class="info-value">${a.nombre}</div></div>
                <div class="info-item"><div class="info-label">Especialidad</div><div class="info-value">${a.especialidad}</div></div>
                <div class="info-item"><div class="info-label">Cédula</div><div class="info-value">${a.cedula}</div></div>
                <div class="info-item"><div class="info-label">Estado</div><div class="info-value">${a.estado}</div></div>
              </div>
              <p class="text-tertiary" style="font-size:12px; margin-top:10px;">La edición de perfil de usuario real se habilitará en la fase de producción con autenticación (ver Ruta a producción).</p>
            `})}
        </div>

        <div class="stack">
          ${d({title:"Respaldo / Configuración de datos",bodyHtml:`
              <p style="font-size:13px;">
                Esta fase no usa base de datos real. Las altas y ediciones que hagas (pacientes, citas, consultas, recetas,
                documentos y estudios) se guardan localmente en <strong>IndexedDB</strong> de este navegador
                ${f()?"":" — IndexedDB no está disponible en este navegador, así que los cambios no persistirán entre recargas."}.
              </p>
              <div class="view-actions" style="margin-top:12px;">
                <button type="button" class="btn btn-secondary" id="btn-exportar">${r("download",{size:14})} Exportar respaldo (JSON)</button>
                <label class="btn btn-secondary" for="input-importar" style="cursor:pointer;">${r("upload",{size:14})} Importar respaldo
                  <input type="file" id="input-importar" accept="application/json" style="display:none;" />
                </label>
                <button type="button" class="btn btn-danger" id="btn-reset">${r("refresh",{size:14})} Restablecer datos demo</button>
              </div>
              <div id="respaldo-status" class="text-tertiary" style="font-size:12px; margin-top:8px;"></div>
            `})}

          ${d({title:"Ruta a producción",bodyHtml:`
              <p style="font-size:13px;">
                Esta demo corre 100% en el navegador con datos ficticios. La segunda etapa (backend real, base de datos,
                autenticación, auditoría e interoperabilidad HL7 FHIR / DICOMweb) está documentada en
                <code>docs/PRODUCTION_ROADMAP.md</code> dentro del repositorio.
              </p>
            `})}
        </div>
      </div>
    </div>
  `,document.getElementById("theme-options").addEventListener("change",e=>{e.target.name==="theme"&&b(e.target.value)}),document.getElementById("btn-exportar").addEventListener("click",async()=>{const e=await g(),o=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),i=URL.createObjectURL(o),t=document.createElement("a");t.href=i,t.download=`respaldo-demo-consulta-practica-${new Date().toISOString().slice(0,10)}.json`,t.click(),URL.revokeObjectURL(i),l("Respaldo exportado.")}),document.getElementById("input-importar").addEventListener("change",async e=>{const o=e.target.files[0];if(o)try{const i=await o.text(),t=JSON.parse(i);for(const n of y)Array.isArray(t[n])&&t[n].length&&await x(n,t[n]);l("Respaldo importado. Recargando…"),setTimeout(()=>window.location.reload(),800)}catch(i){console.error(i),l("No se pudo importar el archivo. Verifica que sea un respaldo JSON válido.")}}),document.getElementById("btn-reset").addEventListener("click",async()=>{confirm("Esto eliminará todos los cambios locales (altas y ediciones) y volverá a los datos originales de la demo. ¿Continuar?")&&(await h(),l("Datos restablecidos. Recargando…"),setTimeout(()=>window.location.reload(),500))})}function l(s){const a=document.getElementById("respaldo-status");a&&(a.textContent=s)}function R(){c.forEach(s=>s()),c=[]}export{$ as mount,R as unmount};
