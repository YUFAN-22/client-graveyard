(function(){
  function renderTraits(c){return c.traits.length?c.traits.map(t=>`<span>${CGUtils.esc(t)}</span>`).join(''):'<span>暂无特质记录</span>'}
  function sortedEvents(c){return [...c.events].sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||(a.createdAt||'').localeCompare(b.createdAt||''))}
  function render(state,id){
    const c=state.clients.find(x=>x.id===id), box=document.getElementById('profileContent');
    if(!c){box.innerHTML='<div class="profile-shell"><a class="pixel-btn" href="#graveyard">← 返回墓园</a><div class="no-events" style="margin-top:20px">没有找到这块墓碑。</div></div>';return}
    const lv=CGGraveyard.level(c.poop), events=sortedEvents(c);
    box.innerHTML=`<div class="profile-shell">
      <div class="profile-topbar"><a class="pixel-btn" href="#graveyard">← 返回墓园</a><div class="profile-actions"><button class="pixel-btn" data-action="edit-client" data-id="${CGUtils.esc(c.id)}">✎ 编辑资料</button><button class="pixel-btn" data-action="share-card" data-id="${CGUtils.esc(c.id)}">▧ 生成分享卡</button><button class="pixel-btn danger" data-action="delete-client" data-id="${CGUtils.esc(c.id)}">⚰ 彻底超度</button></div></div>
      <section class="profile-hero">
        <div class="profile-stone-wrap" data-level="${lv}"><div class="grave-plot" data-level="${lv}" style="width:270px"><div class="grave-stage"><span class="crow" aria-hidden="true"></span>${CGGraveyard.stoneMarkup(c,true)}</div></div></div>
        <div class="profile-info"><p class="eyebrow">CLIENT ARCHIVE · ${CGUtils.esc(c.burialDate)}</p><h1>${CGUtils.esc(c.name)}</h1><div class="profile-traits">${renderTraits(c)}</div><blockquote class="epitaph">${CGUtils.esc(c.epitaph||'这里没有留下墓志铭，只有经验。')}</blockquote>
          <div class="profile-stats"><div class="profile-stat"><b>${c.incense}</b><span>INCENSE // 上香次数</span></div><div class="profile-stat"><b>${c.poop}</b><span>ANGER // 扔大便次数</span></div><div class="profile-stat"><b>${c.events.length}</b><span>LOGS // 合作事件</span></div><div class="profile-stat"><b>${c.viewCount||0}</b><span>VISIT // 祭扫次数</span></div></div>
          <div class="profile-reactions"><button class="pixel-btn primary" data-action="react" data-type="incense" data-id="${CGUtils.esc(c.id)}">${CGGraveyard.icon('incense')}<span>给它上香</span></button><button class="pixel-btn" data-action="react" data-type="poop" data-id="${CGUtils.esc(c.id)}">${CGGraveyard.icon('poop')}<span>给它扔大便</span></button></div>
        </div>
      </section>
      <section class="timeline-section"><div class="timeline-head"><div><p class="eyebrow">PAST EVENTS</p><h2>此方往事</h2></div><button class="pixel-btn primary" data-action="new-event" data-id="${CGUtils.esc(c.id)}">＋ 记录新的往事</button></div>
      ${events.length?`<div class="timeline">${events.map(e=>`<article class="timeline-item"><div class="timeline-date">${CGUtils.esc(e.date||'日期未记')}</div><div class="timeline-card"><div class="timeline-type">${CGUtils.esc(e.type)}</div><h3>${CGUtils.esc(e.title||'未命名事件')}</h3><p>${CGUtils.esc(e.content||'')}</p><div class="timeline-tools"><button data-action="edit-event" data-client-id="${CGUtils.esc(c.id)}" data-event-id="${CGUtils.esc(e.id)}">编辑</button><button data-action="delete-event" data-client-id="${CGUtils.esc(c.id)}" data-event-id="${CGUtils.esc(e.id)}">删除</button></div></div></article>`).join('')}</div>`:'<div class="no-events">这里还没有往事记录。项目经验值得被写下来，而不只是被气过去。</div>'}
      </section>
    </div>`;
  }
  window.CGProfile={render};
})();
