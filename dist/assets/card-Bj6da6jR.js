import{e as d}from"./index-DOxX59Tn.js";function e({label:a,value:c,icon:s="",trend:r="",trendDirection:l="",tone:i="primary"}){const o=l?` ${l}`:"";return`
    <div class="card metric-card">
      <div class="metric-label">
        <span class="metric-icon badge-${i}" style="background:var(--color-${i}-soft, var(--color-primary-soft)); color:var(--color-${i}, var(--color-primary));">${s}</span>
        ${d(a)}
      </div>
      <div class="metric-value">${c}</div>
      ${r?`<div class="metric-trend${o}">${d(r)}</div>`:""}
    </div>
  `}function $({title:a,actionsHtml:c="",bodyHtml:s="",id:r=""}){return`
    <section class="card"${r?` id="${r}"`:""}>
      ${a?`<div class="card-header"><h2>${d(a)}</h2>${c?`<div class="view-actions">${c}</div>`:""}</div>`:""}
      ${s}
    </section>
  `}export{$ as c,e as m};
