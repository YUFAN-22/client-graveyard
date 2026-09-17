(function(){
  const TYPES=['咨询','改稿','付款','拖款','临时需求','失联','离谱事件','正常合作','项目结束','其他'];
  const TRAITS=['无限改稿','拖款','需求不明确','凌晨发消息','已读不回','临时加需求','预算很低','要求很多','审美独特','一句话推翻全部','还是第一版好','这个很简单','临时改方向','要求当天完成','长期失联','很难确认需求','预算砍半','临近截止才反馈'];
  const EPITAPHS=[
    '需求虽逝，修改意见永存。','这里埋着一次没有收到尾款的合作。','他说，这真的是最后一版。','生前最后一句话：再稍微调整一下。','甲方已远去，文件夹里还有 FINAL_18。','这里安息着被一句“感觉不对”推翻的三天。','愿下一次需求确认发生在开工之前。','预算有限，想法无限。','沟通结束了，经验留下了。','愿天堂没有“顺便再加一个小需求”。'
  ];
  const INCENSE_LINES=['吃一堑，长一智。','往事已矣，下次记得收定金。','愿天堂没有无限改稿。','这一炷香，敬当年年轻的自己。','愿下一位甲方懂得确认需求。','项目已经结束，经验留下了。','愿 FINAL 真的是 FINAL。','先确认需求，再开始干活。'];
  const POOP_LINES=['情绪稳定 +1','功德 -1，心情 +10','你的愤怒已保存到本地。','这次就算了。','冷静，下一单先收定金。','系统已接收你的情绪。','建议下次先签合同。','💩 已成功命中需求变更记录。'];

  function typeOptions(selected='其他'){
    return TYPES.map(t=>`<option value="${CGUtils.esc(t)}" ${t===selected?'selected':''}>${CGUtils.esc(t)}</option>`).join('');
  }
  function makeEventRow(event={}){
    const blank=!event.id&&!event.date&&!event.title&&!event.content&&!event.text;
    const e=blank?{id:CGUtils.uid('event'),date:'',type:event.type||'其他',title:'',content:''}:CGUtils.normalizeEvent(event);
    const row=document.createElement('div');
    row.className='event-row'; row.dataset.id=e.id;
    row.innerHTML=`
      <input class="ev-date" type="date" value="${CGUtils.esc(e.date)}" aria-label="事件日期">
      <select class="ev-type" aria-label="事件类型">${typeOptions(e.type)}</select>
      <input class="ev-title" maxlength="60" value="${CGUtils.esc(e.title)}" placeholder="事件标题" aria-label="事件标题">
      <textarea class="ev-content" maxlength="1200" rows="2" placeholder="发生了什么？学到了什么？" aria-label="事件内容">${CGUtils.esc(e.content)}</textarea>
      <button type="button" class="pixel-btn danger remove-row" data-action="remove-event-row" aria-label="删除事件">×</button>`;
    return row;
  }
  function collectEventRows(container){
    return [...container.querySelectorAll('.event-row')].map(row=>({
      id:row.dataset.id||CGUtils.uid('event'),
      date:row.querySelector('.ev-date').value,
      type:row.querySelector('.ev-type').value||'其他',
      title:row.querySelector('.ev-title').value.trim(),
      content:row.querySelector('.ev-content').value.trim(),
      createdAt:new Date().toISOString()
    })).filter(e=>e.date||e.title||e.content).map((e,i)=>({...e,title:e.title||`往事 ${i+1}`}));
  }
  window.CGContent={TYPES,TRAITS,EPITAPHS,INCENSE_LINES,POOP_LINES,typeOptions,makeEventRow,collectEventRows};
})();
