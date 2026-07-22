import{p as y,f as S,s as M}from"./index-kGilWOpK.js";import{c as L}from"./sectionNav-CdciFC9g.js";const T={sin:e=>Math.sin(e*Math.PI/180),cos:e=>Math.cos(e*Math.PI/180),tan:e=>Math.tan(e*Math.PI/180),log:Math.log10,ln:Math.log,sqrt:Math.sqrt},f={pi:Math.PI,e:Math.E};function C(e){const t=[];let a=0;for(;a<e.length;){const l=e[a];if(/\s/.test(l)){a++;continue}if(/[0-9.]/.test(l)){let i="";for(;a<e.length&&/[0-9.]/.test(e[a]);)i+=e[a],a++;t.push({type:"number",value:parseFloat(i)});continue}if(/[a-zA-Z]/.test(l)){let i="";for(;a<e.length&&/[a-zA-Z]/.test(e[a]);)i+=e[a],a++;const c=i.toLowerCase();f[c]!==void 0?t.push({type:"number",value:f[c]}):t.push({type:"function",value:c});continue}if("+-*/^(),%".includes(l)){t.push({type:"op",value:l}),a++;continue}throw new Error(`Carácter no válido: "${l}"`)}return t}const p={u:4,"^":3,"*":2,"/":2,"%":2,"+":1,"-":1};function I(e){const t=[],a=[];let l=null;for(e.forEach(i=>{if(i.type==="number")t.push(i);else if(i.type==="function")a.push(i);else if(i.value===",")for(;a.length&&a[a.length-1].value!=="(";)t.push(a.pop());else if(i.value==="(")a.push(i);else if(i.value===")"){for(;a.length&&a[a.length-1].value!=="(";)t.push(a.pop());a.pop(),a.length&&a[a.length-1].type==="function"&&t.push(a.pop())}else{const o=i.value==="-"&&(!l||l.type==="op"&&l.value!==")")?{type:"op",value:"u",unary:!0}:i;for(;a.length&&a[a.length-1].type==="op"&&a[a.length-1].value!=="("&&(p[a[a.length-1].value]>p[o.value]||p[a[a.length-1].value]===p[o.value]&&o.value!=="^"&&o.value!=="u");)t.push(a.pop());a.push(o)}l=i});a.length;)t.push(a.pop());return t}function x(e){const t=[];if(e.forEach(a=>{if(a.type==="number")t.push(a.value);else if(a.type==="function"){const l=T[a.value];if(!l)throw new Error(`Función desconocida: ${a.value}`);t.push(l(t.pop()))}else if(a.value==="u")t.push(-t.pop());else{const l=t.pop(),i=t.pop();switch(a.value){case"+":t.push(i+l);break;case"-":t.push(i-l);break;case"*":t.push(i*l);break;case"/":t.push(i/l);break;case"%":t.push(i%l);break;case"^":t.push(Math.pow(i,l));break;default:throw new Error(`Operador desconocido: ${a.value}`)}}}),t.length!==1)throw new Error("Expresión inválida");return t[0]}function b(e){if(!e||!e.trim())return 0;const t=C(e),a=I(t),l=x(a);if(!Number.isFinite(l))throw new Error("Resultado no numérico");return l}const _=[{label:"C",action:"clear",cls:"calc-op"},{label:"(",action:"append",value:"("},{label:")",action:"append",value:")"},{label:"÷",action:"append",value:"/",cls:"calc-op"},{label:"7",action:"append",value:"7"},{label:"8",action:"append",value:"8"},{label:"9",action:"append",value:"9"},{label:"×",action:"append",value:"*",cls:"calc-op"},{label:"4",action:"append",value:"4"},{label:"5",action:"append",value:"5"},{label:"6",action:"append",value:"6"},{label:"−",action:"append",value:"-",cls:"calc-op"},{label:"1",action:"append",value:"1"},{label:"2",action:"append",value:"2"},{label:"3",action:"append",value:"3"},{label:"+",action:"append",value:"+",cls:"calc-op"},{label:"⌫",action:"backspace"},{label:"0",action:"append",value:"0"},{label:".",action:"append",value:"."},{label:"=",action:"equals",cls:"calc-equals"}],$=[{label:"sin",action:"append",value:"sin(",cls:"calc-fn"},{label:"cos",action:"append",value:"cos(",cls:"calc-fn"},{label:"tan",action:"append",value:"tan(",cls:"calc-fn"},{label:"log",action:"append",value:"log(",cls:"calc-fn"},{label:"ln",action:"append",value:"ln(",cls:"calc-fn"},{label:"√",action:"append",value:"sqrt(",cls:"calc-fn"},{label:"xʸ",action:"append",value:"^",cls:"calc-fn"},{label:"π",action:"append",value:"pi",cls:"calc-fn"},{label:"e",action:"append",value:"e",cls:"calc-fn"},{label:"%",action:"append",value:"%",cls:"calc-fn"}];function h(e,{scientific:t=!1}={}){let a="";e.innerHTML=`
    <div class="card">
      <div class="calc-expression" id="calc-expr"></div>
      <div class="calc-display" id="calc-display">0</div>
      <div style="height:12px;"></div>
      ${t?`<div class="calc-keypad" style="margin-bottom:8px;">${$.map(c).join("")}</div>`:""}
      <div class="calc-keypad">${_.map(c).join("")}</div>
    </div>
  `;const l=e.querySelector("#calc-display"),i=e.querySelector("#calc-expr");function c(n){return`<button type="button" class="calc-btn ${n.cls||""}" data-action="${n.action}" data-value="${n.value||""}">${n.label}</button>`}function o(){if(i.textContent=a,!a){l.textContent="0";return}try{const n=b(a);l.textContent=s(n)}catch{l.textContent=a}}function s(n){if(!Number.isFinite(n))return"Error";const r=Math.round(n*1e10)/1e10;return String(r)}e.querySelectorAll(".calc-btn").forEach(n=>{n.addEventListener("click",()=>{const{action:r,value:d}=n.dataset;if(r==="append")a+=d;else if(r==="clear")a="";else if(r==="backspace")a=a.slice(0,-1);else if(r==="equals")try{a=s(b(a))}catch{l.textContent="Error",i.textContent="Expresión inválida";return}o()})}),o()}function q(e){h(e,{scientific:!1})}const F=Object.freeze(Object.defineProperty({__proto__:null,render:q},Symbol.toStringTag,{value:"Module"}));function w(e){h(e,{scientific:!0})}const O=Object.freeze(Object.defineProperty({__proto__:null,render:w},Symbol.toStringTag,{value:"Module"}));function E(e){return e<18.5?{label:"Bajo peso",tone:"badge-info"}:e<25?{label:"Normal",tone:"badge-success"}:e<30?{label:"Sobrepeso",tone:"badge-warning"}:e<35?{label:"Obesidad grado I",tone:"badge-danger"}:e<40?{label:"Obesidad grado II",tone:"badge-danger"}:{label:"Obesidad grado III",tone:"badge-danger"}}function H(e){e.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Índice de Masa Corporal (IMC)</h2></div>
      <div class="form-grid">
        <div class="form-field">
          <label for="imc-peso">Peso (kg)</label>
          <input class="input" type="number" id="imc-peso" min="0" step="0.1" placeholder="70" />
        </div>
        <div class="form-field">
          <label for="imc-talla">Talla (cm)</label>
          <input class="input" type="number" id="imc-talla" min="0" step="0.1" placeholder="170" />
        </div>
      </div>
      <div id="imc-resultado" style="margin-top:16px;"></div>
    </div>
  `;const t=e.querySelector("#imc-peso"),a=e.querySelector("#imc-talla"),l=e.querySelector("#imc-resultado");function i(){const c=parseFloat(t.value),o=parseFloat(a.value),s=y(c,o);if(!s){l.innerHTML="";return}const n=E(s);l.innerHTML=`
      <div class="calc-display" style="text-align:left;">${s} <span style="font-size:14px; font-weight:400; color:var(--text-tertiary);">kg/m²</span></div>
      <span class="badge ${n.tone}" style="margin-top:8px;">${n.label}</span>
    `}t.addEventListener("input",i),a.addEventListener("input",i)}const j=Object.freeze(Object.defineProperty({__proto__:null,render:H},Symbol.toStringTag,{value:"Module"}));function P(e){e.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Superficie Corporal (fórmula de Mosteller)</h2></div>
      <div class="form-grid">
        <div class="form-field">
          <label for="sc-peso">Peso (kg)</label>
          <input class="input" type="number" id="sc-peso" min="0" step="0.1" placeholder="70" />
        </div>
        <div class="form-field">
          <label for="sc-talla">Talla (cm)</label>
          <input class="input" type="number" id="sc-talla" min="0" step="0.1" placeholder="170" />
        </div>
      </div>
      <div id="sc-resultado" style="margin-top:16px;"></div>
      <p class="text-tertiary" style="font-size:11.5px; margin-top:10px;">SC (m²) = √((talla en cm × peso en kg) / 3600)</p>
    </div>
  `;const t=e.querySelector("#sc-peso"),a=e.querySelector("#sc-talla"),l=e.querySelector("#sc-resultado");function i(){const c=parseFloat(t.value),o=parseFloat(a.value);if(!c||!o){l.innerHTML="";return}const s=Math.sqrt(o*c/3600);l.innerHTML=`<div class="calc-display" style="text-align:left;">${s.toFixed(2)} <span style="font-size:14px; font-weight:400; color:var(--text-tertiary);">m²</span></div>`}t.addEventListener("input",i),a.addEventListener("input",i)}const A=Object.freeze(Object.defineProperty({__proto__:null,render:P},Symbol.toStringTag,{value:"Module"}));function B(e){e.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Cálculo de dosis</h2></div>
      <div class="form-grid">
        <div class="form-field">
          <label for="dosis-peso">Peso del paciente (kg)</label>
          <input class="input" type="number" id="dosis-peso" min="0" step="0.1" placeholder="20" />
        </div>
        <div class="form-field">
          <label for="dosis-mgkg">Dosis prescrita (mg/kg)</label>
          <input class="input" type="number" id="dosis-mgkg" min="0" step="0.01" placeholder="10" />
        </div>
        <div class="form-field">
          <label for="dosis-conc">Concentración disponible (mg/mL)</label>
          <input class="input" type="number" id="dosis-conc" min="0" step="0.01" placeholder="5" />
        </div>
      </div>
      <div id="dosis-resultado" style="margin-top:16px;"></div>
    </div>
  `;const t=e.querySelector("#dosis-peso"),a=e.querySelector("#dosis-mgkg"),l=e.querySelector("#dosis-conc"),i=e.querySelector("#dosis-resultado");function c(){const o=parseFloat(t.value),s=parseFloat(a.value),n=parseFloat(l.value);if(!o||!s){i.innerHTML="";return}const r=o*s,d=n?r/n:null;i.innerHTML=`
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Dosis total</div><div class="info-value">${r.toFixed(2)} mg</div></div>
        ${d!==null?`<div class="info-item"><div class="info-label">Volumen a administrar</div><div class="info-value">${d.toFixed(2)} mL</div></div>`:""}
      </div>
    `}[t,a,l].forEach(o=>o.addEventListener("input",c))}const z=Object.freeze(Object.defineProperty({__proto__:null,render:B},Symbol.toStringTag,{value:"Module"}));function N(e){e.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Goteo intravenoso</h2></div>
      <div class="form-grid">
        <div class="form-field">
          <label for="giv-volumen">Volumen total (mL)</label>
          <input class="input" type="number" id="giv-volumen" min="0" step="1" placeholder="1000" />
        </div>
        <div class="form-field">
          <label for="giv-tiempo">Tiempo de infusión (horas)</label>
          <input class="input" type="number" id="giv-tiempo" min="0" step="0.1" placeholder="8" />
        </div>
        <div class="form-field">
          <label for="giv-factor">Factor de goteo</label>
          <select class="input" id="giv-factor">
            <option value="20">Macrogotero (20 gtt/mL)</option>
            <option value="60">Microgotero (60 gtt/mL)</option>
            <option value="10">Macrogotero (10 gtt/mL)</option>
            <option value="15">Macrogotero (15 gtt/mL)</option>
          </select>
        </div>
      </div>
      <div id="giv-resultado" style="margin-top:16px;"></div>
    </div>
  `;const t=e.querySelector("#giv-volumen"),a=e.querySelector("#giv-tiempo"),l=e.querySelector("#giv-factor"),i=e.querySelector("#giv-resultado");function c(){const o=parseFloat(t.value),s=parseFloat(a.value),n=parseFloat(l.value);if(!o||!s){i.innerHTML="";return}const r=o/s,d=o*n/(s*60);i.innerHTML=`
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Velocidad de infusión</div><div class="info-value">${r.toFixed(1)} mL/h</div></div>
        <div class="info-item"><div class="info-label">Ritmo de goteo</div><div class="info-value">${d.toFixed(0)} gotas/min</div></div>
      </div>
    `}[t,a,l].forEach(o=>o.addEventListener("input",c))}const D=Object.freeze(Object.defineProperty({__proto__:null,render:N},Symbol.toStringTag,{value:"Module"}));function m(e){const[t,a,l]=e.split("-").map(Number);return new Date(t,a-1,l)}function k(e){e.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Edad gestacional</h2></div>
      <div class="form-grid">
        <div class="form-field">
          <label for="eg-fum">Fecha de última menstruación (FUM)</label>
          <input class="input" type="date" id="eg-fum" />
        </div>
        <div class="form-field">
          <label for="eg-referencia">Calcular a partir de</label>
          <input class="input" type="date" id="eg-referencia" />
        </div>
      </div>
      <div id="eg-resultado" style="margin-top:16px;"></div>
      <p class="text-tertiary" style="font-size:11.5px; margin-top:10px;">Fecha probable de parto calculada con la regla de Naegele (FUM + 280 días).</p>
    </div>
  `;const t=e.querySelector("#eg-fum"),a=e.querySelector("#eg-referencia"),l=e.querySelector("#eg-resultado");a.value=new Date().toISOString().slice(0,10);function i(){if(!t.value||!a.value){l.innerHTML="";return}const c=m(t.value),o=m(a.value),s=Math.round((o-c)/864e5);if(s<0){l.innerHTML='<div class="empty-state">La fecha de referencia es anterior a la FUM.</div>';return}const n=Math.floor(s/7),r=s%7,d=new Date(c);d.setDate(d.getDate()+280),l.innerHTML=`
      <div class="info-grid">
        <div class="info-item"><div class="info-label">Edad gestacional</div><div class="info-value">${n} semanas, ${r} días</div></div>
        <div class="info-item"><div class="info-label">Fecha probable de parto</div><div class="info-value">${S(d.toISOString().slice(0,10))}</div></div>
        <div class="info-item"><div class="info-label">Trimestre</div><div class="info-value">${n<13?"1º":n<27?"2º":"3º"}</div></div>
      </div>
    `}t.addEventListener("input",i),a.addEventListener("input",i)}const G=Object.freeze(Object.defineProperty({__proto__:null,render:k},Symbol.toStringTag,{value:"Module"})),v={peso:{label:"Peso",unitA:"kg",unitB:"lb",toB:e=>e*2.20462,toA:e=>e/2.20462},talla:{label:"Talla / longitud",unitA:"cm",unitB:"in",toB:e=>e/2.54,toA:e=>e*2.54},temperatura:{label:"Temperatura",unitA:"°C",unitB:"°F",toB:e=>e*1.8+32,toA:e=>(e-32)/1.8},glucosa:{label:"Glucosa",unitA:"mg/dL",unitB:"mmol/L",toB:e=>e/18.0182,toA:e=>e*18.0182}};function R(e){e.innerHTML=`
    <div class="card">
      <div class="card-header"><h2>Conversores médicos</h2></div>
      <div class="form-field" style="margin-bottom:16px;">
        <label for="conv-categoria">Tipo de conversión</label>
        <select class="input" id="conv-categoria">
          ${Object.entries(v).map(([n,r])=>`<option value="${n}">${r.label}</option>`).join("")}
        </select>
      </div>
      <div class="form-grid">
        <div class="form-field">
          <label id="conv-label-a"></label>
          <input class="input" type="number" id="conv-input-a" step="any" />
        </div>
        <div class="form-field">
          <label id="conv-label-b"></label>
          <input class="input" type="number" id="conv-input-b" step="any" />
        </div>
      </div>
    </div>
  `;const t=e.querySelector("#conv-categoria"),a=e.querySelector("#conv-input-a"),l=e.querySelector("#conv-input-b"),i=e.querySelector("#conv-label-a"),c=e.querySelector("#conv-label-b");function o(){const n=v[t.value];i.textContent=n.unitA,c.textContent=n.unitB}t.addEventListener("change",()=>{a.value="",l.value="",o()}),a.addEventListener("input",()=>{const n=v[t.value];if(a.value===""){l.value="";return}l.value=s(n.toB(parseFloat(a.value)))}),l.addEventListener("input",()=>{const n=v[t.value];if(l.value===""){a.value="";return}a.value=s(n.toA(parseFloat(l.value)))});function s(n){return Math.round(n*100)/100}o()}const U=Object.freeze(Object.defineProperty({__proto__:null,render:R},Symbol.toStringTag,{value:"Module"})),g=[{id:"basica",label:"Básica",icon:"calculator",mod:F},{id:"cientifica",label:"Científica",icon:"sliders",mod:O},{id:"imc",label:"IMC",icon:"activity",mod:j},{id:"superficieCorporal",label:"Superficie corporal",icon:"ruler",mod:A},{id:"dosis",label:"Cálculo de dosis",icon:"syringe",mod:z},{id:"goteoIv",label:"Goteo intravenoso",icon:"droplets",mod:D},{id:"edadGestacional",label:"Edad gestacional",icon:"baby",mod:G},{id:"conversores",label:"Conversores médicos",icon:"swap",mod:U}];let u=null;async function Y(e){M("Calculadora","Herramientas de cálculo clínico rápidas y confiables"),e.innerHTML=`
    <div class="view">
      <div class="view-header">
        <div>
          <h1>Calculadora</h1>
          <p>Calculadora básica, científica y herramientas de cálculo clínico.</p>
        </div>
      </div>
      <div id="calculadora-layout"></div>
    </div>
  `,u=L({items:g,activeId:"basica",ariaLabel:"Herramientas de calculadora",renderPanel:(t,a)=>g.find(i=>i.id===t).mod.render(a)}),document.getElementById("calculadora-layout").appendChild(u.el)}function Z(){u&&(u.destroy(),u=null)}export{Y as mount,Z as unmount};
