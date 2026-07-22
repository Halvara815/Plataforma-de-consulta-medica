import{e as l}from"./index-kGilWOpK.js";function f({name:e,label:s,value:a="",type:r="text",required:t=!1,span2:i=!1,placeholder:n="",hint:o=""}){return`
    <div class="form-field${i?" span-2":""}">
      <label for="f-${e}">${l(s)}${t?" *":""}</label>
      <input class="input" id="f-${e}" name="${e}" type="${r}" value="${l(a)}" placeholder="${l(n)}" ${t?"required":""} />
      ${o?`<span class="hint">${l(o)}</span>`:""}
    </div>
  `}function d({name:e,label:s,value:a="",required:r=!1,span2:t=!0,rows:i=3,placeholder:n=""}){return`
    <div class="form-field${t?" span-2":""}">
      <label for="f-${e}">${l(s)}${r?" *":""}</label>
      <textarea class="input" id="f-${e}" name="${e}" rows="${i}" placeholder="${l(n)}" ${r?"required":""}>${l(a)}</textarea>
    </div>
  `}function p({name:e,label:s,value:a="",options:r=[],required:t=!1,span2:i=!1}){const n=r.map(o=>{const $=typeof o=="string"?o:o.value,c=typeof o=="string"?o:o.label;return`<option value="${l($)}" ${String($)===String(a)?"selected":""}>${l(c)}</option>`}).join("");return`
    <div class="form-field${i?" span-2":""}">
      <label for="f-${e}">${l(s)}${t?" *":""}</label>
      <select class="input" id="f-${e}" name="${e}" ${t?"required":""}>${n}</select>
    </div>
  `}function v({name:e,label:s,value:a="",options:r=[]}){const t=r.map(i=>`
      <label class="radio-option">
        <input type="radio" name="${e}" value="${l(i.value)}" ${i.value===a?"checked":""} />
        ${l(i.label)}
      </label>`).join("");return`
    <div class="form-field">
      <label>${l(s)}</label>
      <div class="radio-group">${t}</div>
    </div>
  `}function m(e){const s=new FormData(e),a={};for(const[r,t]of s.entries())a[r]=t;return a}function b(e){const s=[];return e.querySelectorAll("[required]").forEach(a=>{!a.value||!a.value.trim()?(a.classList.add("has-error"),s.push(a.name)):a.classList.remove("has-error")}),s.length===0}export{d as a,m as g,v as r,p as s,f as t,b as v};
