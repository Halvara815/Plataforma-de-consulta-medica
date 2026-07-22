import{e as d}from"./index-kGilWOpK.js";function v({label:s,value:c,icon:o="",trend:r="",trendDirection:i="",tone:a="primary"}){const e=i?` ${i}`:"";return`
    <div class="card metric-card">
      <div class="metric-label">
        <span class="metric-icon badge-${a}" style="background:var(--color-${a}-soft, var(--color-primary-soft)); color:var(--color-${a}, var(--color-primary));">${o}</span>
        ${d(s)}
      </div>
      <div class="metric-value">${c}</div>
      ${r?`<div class="metric-trend${e}">${d(r)}</div>`:""}
    </div>
  `}function $({title:s,actionsHtml:c="",bodyHtml:o="",id:r="",headerClass:i=""}){const a=["card-header",i].filter(Boolean).join(" ");return`
    <section class="card"${r?` id="${r}"`:""}>
      ${s?`<div class="${a}"><h2>${d(s)}</h2>${c?`<div class="view-actions">${c}</div>`:""}</div>`:""}
      ${o}
    </section>
  `}export{$ as c,v as m};
