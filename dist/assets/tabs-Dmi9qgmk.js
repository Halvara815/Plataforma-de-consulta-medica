import{e as c}from"./index-BbYPTjK5.js";function b({tabs:l,activeId:e,onChange:n,panelHtml:i}){const a=document.createElement("div");a.className="tabs-wrapper",s();function s(){const r=l.map(t=>`<button type="button" class="tab-btn${t.id===e?" is-active":""}" data-tab="${t.id}">${c(t.label)}</button>`).join("");a.innerHTML=`
      <div class="tabs" role="tablist">${r}</div>
      <div class="tab-panel">${i(e)}</div>
    `,a.querySelectorAll(".tab-btn").forEach(t=>{t.addEventListener("click",()=>{t.dataset.tab!==e&&(e=t.dataset.tab,n&&n(e),s())})})}return{el:a,setActive(r){e=r,s()}}}export{b as c};
