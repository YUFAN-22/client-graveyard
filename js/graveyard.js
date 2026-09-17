(function(){
  function level(poop){return poop>=100?4:poop>=60?3:poop>=30?2:poop>=10?1:0}
  function traitText(c){const a=c.traits||[];if(!a.length)return '暂无特质';return a.slice(0,2).join(' · ')+(a.length>2?` +${a.length-2}`:'')}
  function traitMarkup(c){
    const a=c.traits||[];
    if(!a.length)return '<span class="stone-trait">暂无特质</span>';
    const visible=a.slice(0,2).map(t=>`<span class="stone-trait">${CGUtils.esc(t)}</span>`).join('');
    return visible+(a.length>2?`<span class="stone-trait">+${a.length-2}</span>`:'');
  }
  function icon(type){return `<i class="px-icon ${type==='incense'?'px-candle':'px-poop'}" aria-hidden="true"></i>`}
  function stoneMarkup(c,profile=false){
    const lv=level(c.poop||0);
    return `<div class="grave-stone skin-${CGUtils.esc(c.skin||'arch')}" data-client-stone="${CGUtils.esc(c.id)}" ${profile?`data-action="stone-tap" data-id="${CGUtils.esc(c.id)}"`:''}>
      ${lv===4?'<span class="memorial-badge">重点纪念</span>':''}<span class="cracks"></span>
      <div class="grave-name">${CGUtils.esc(c.name||'未命名')}</div>
      <div class="grave-traits">${traitMarkup(c)}</div>
      <div class="grave-counts"><span>${icon('incense')}${String(c.incense||0).padStart(2,'0')}</span><span>${icon('poop')}${String(c.poop||0).padStart(2,'0')}</span></div>
      <div class="grave-date">EST. ${CGUtils.esc(c.burialDate||'---- -- --')}</div>
    </div>`;
  }
  function cardMarkup(c){
    const lv=level(c.poop||0);
    return `<article class="grave-plot" data-id="${CGUtils.esc(c.id)}" data-level="${lv}">
      <div class="grave-stage"><span class="select-arrow" aria-hidden="true">▶</span><span class="crow" aria-hidden="true"></span>${stoneMarkup(c)}</div>
      <div class="grave-actions">
        <button class="pixel-btn" data-action="react" data-type="incense" data-id="${CGUtils.esc(c.id)}">${icon('incense')}<span>上香</span></button>
        <button class="pixel-btn" data-action="react" data-type="poop" data-id="${CGUtils.esc(c.id)}">${icon('poop')}<span>扔大便</span></button>
      </div>
      <div class="grave-meta">${String(c.events.length).padStart(2,'0')} LOG · ${String(c.viewCount||0).padStart(2,'0')} VISIT</div>
    </article>`;
  }
  function filtered(state){
    const q=(state.settings.search||'').trim().toLowerCase(), trait=state.settings.selectedTrait||'';
    return state.clients.filter(c=>{
      if(trait&&!c.traits.includes(trait))return false;
      if(!q)return true;
      const hay=[c.name,...c.traits,c.epitaph,...c.events.flatMap(e=>[e.type,e.title,e.content])].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }
  function renderFilters(state){
    const counts={};state.clients.forEach(c=>c.traits.forEach(t=>counts[t]=(counts[t]||0)+1));
    const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);
    document.getElementById('filterChips').innerHTML=`<button class="filter-chip ${state.settings.selectedTrait?'':'active'}" data-filter="">ALL ${state.clients.length}</button>`+top.map(([t,n])=>`<button class="filter-chip ${state.settings.selectedTrait===t?'active':''}" data-filter="${CGUtils.esc(t)}">${CGUtils.esc(t)} ${n}</button>`).join('');
  }
  function renderToday(state){
    const el=document.getElementById('todayMemorial');
    if(!state.clients.length){el.innerHTML='<p class="eyebrow">TODAY MEMORIAL</p><h3>墓园尚空</h3><p>愿今天也不需要建立新的墓碑。</p>';return}
    const key=Number(CGUtils.today().replaceAll('-',''));const c=state.clients[key%state.clients.length];
    const last=c.lastViewedAt?Math.max(0,Math.floor((Date.now()-new Date(c.lastViewedAt).getTime())/86400000)):null;
    el.innerHTML=`<p class="eyebrow">TODAY MEMORIAL</p><h3>${CGUtils.esc(c.name)}</h3><p>${last===null?'还没有正式祭扫过。':last===0?'今天刚刚见过。':`距离上次查看 ${last} 天。`}</p><button class="pixel-btn" data-open-client="${CGUtils.esc(c.id)}">▶ 去看看老朋友</button>`;
  }
  function render(state){
    renderFilters(state);renderToday(state);
    const list=filtered(state),grid=document.getElementById('graveGrid'),empty=document.getElementById('emptyState');
    grid.innerHTML=list.map(cardMarkup).join('');
    empty.hidden=state.clients.length!==0;
    if(state.clients.length&&list.length===0)grid.innerHTML='<div class="no-events" style="grid-column:1/-1">NO RESULT // 没有找到符合条件的墓碑。换个关键词或清除筛选试试。</div>';
  }
  function renderStats(state){
    const totalEvents=state.clients.reduce((n,c)=>n+c.events.length,0),incense=state.clients.reduce((n,c)=>n+c.incense,0),poop=state.clients.reduce((n,c)=>n+c.poop,0);
    const traitCounts={};state.clients.forEach(c=>c.traits.forEach(t=>traitCounts[t]=(traitCounts[t]||0)+1));const ranks=Object.entries(traitCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);const max=Math.max(1,...ranks.map(x=>x[1]));
    const years={};state.clients.forEach(c=>{const y=(c.burialDate||'未知').slice(0,4);years[y]=(years[y]||0)+1});const yEntries=Object.entries(years).sort();const yMax=Math.max(1,...yEntries.map(x=>x[1]));
    document.getElementById('statsContent').innerHTML=`
      <div class="stats-grid"><div class="stat-card"><b>${String(state.clients.length).padStart(2,'0')}</b><span>GRAVES // 已安葬甲方</span></div><div class="stat-card"><b>${String(totalEvents).padStart(2,'0')}</b><span>LOGS // 合作事件</span></div><div class="stat-card"><b>${String(incense).padStart(3,'0')}</b><span>INCENSE // 累计上香</span></div><div class="stat-card"><b>${String(poop).padStart(3,'0')}</b><span>ANGER // 累计扔大便</span></div></div>
      <div class="stats-panels"><section class="stats-panel"><h2>最常见甲方特质</h2><div class="trait-rank">${ranks.length?ranks.map(([t,n],i)=>`<div class="rank-row"><span>${i+1}. ${CGUtils.esc(t)}</span><div class="rank-bar"><div class="rank-fill" style="width:${n/max*100}%"></div></div><b>${n}</b></div>`).join(''):'<p class="fine-print">还没有足够的数据。</p>'}</div></section>
      <section class="stats-panel"><h2>年度新增墓碑</h2><div class="year-bars">${yEntries.length?yEntries.map(([y,n])=>`<div class="year-col"><div class="year-bar" style="height:${30+n/yMax*145}px"><b>${n}</b></div>${CGUtils.esc(y)}</div>`).join(''):'<p class="fine-print">暂无数据。</p>'}</div></section></div>
      <section class="stats-panel" style="margin-top:18px"><h2>墓园成就</h2><div class="achievement-grid">${CGAchievements.render(state)}</div></section>`;
  }
  window.CGGraveyard={level,traitText,traitMarkup,stoneMarkup,icon,render,renderStats};
})();
