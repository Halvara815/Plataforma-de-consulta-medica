import{e as u,i as v}from"./index-CfR6KO86.js";function f({title:r,bodyHtml:s,footerHtml:t="",size:m="md",onMount:a,onClose:i}){const e=document.createElement("div");e.className="modal-overlay",e.innerHTML=`
    <div class="modal${m==="lg"?" modal-lg":""}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-header">
        <h2 id="modal-title">${u(r)}</h2>
        <button type="button" class="modal-close" aria-label="Cerrar">${v("x",{size:16})}</button>
      </div>
      <div class="modal-body">${s}</div>
      ${t?`<div class="modal-footer">${t}</div>`:""}
    </div>
  `,document.body.appendChild(e),document.body.style.overflow="hidden";function o(){e.remove(),document.body.style.overflow="",document.removeEventListener("keydown",n),i&&i()}function n(l){l.key==="Escape"&&o()}e.addEventListener("click",l=>{l.target===e&&o()}),e.querySelector(".modal-close").addEventListener("click",o),document.addEventListener("keydown",n);const d=e.querySelector(".modal"),c=d.querySelector("input, select, textarea, button");return c&&c.focus(),a&&a(d,o),{overlay:e,modalEl:d,close:o}}export{f as o};
