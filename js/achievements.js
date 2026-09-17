(function(){
  const defs=[
    {id:'first_grave',icon:'碑',title:'第一座碑',desc:'建立第一个甲方墓碑。',test:s=>s.clients.length>=1},
    {id:'let_go',icon:'香',title:'放下执念',desc:'累计上香 10 次。',test:s=>s.clients.reduce((n,c)=>n+c.incense,0)>=10},
    {id:'emotion_master',icon:'怒',title:'情绪管理大师',desc:'累计扔大便 50 次。',test:s=>s.clients.reduce((n,c)=>n+c.poop,0)>=50},
    {id:'experienced',icon:'录',title:'经验丰富',desc:'累计记录 20 条合作事件。',test:s=>s.clients.reduce((n,c)=>n+c.events.length,0)>=20},
    {id:'researcher',icon:'研',title:'甲方研究专家',desc:'墓园中达到 10 座墓碑。',test:s=>s.clients.length>=10},
    {id:'mature',icon:'静',title:'真正的成熟',desc:'给同一个甲方连续上香 10 次，中途没有扔大便。',test:s=>s.clients.some(c=>c.incenseSincePoop>=10)},
    {id:'century',icon:'冠',title:'重点纪念',desc:'有一块墓碑累计收到 100 个大便。',test:s=>s.clients.some(c=>c.poop>=100)}
  ];
  function check(state,notify=true){
    const unlocked=new Set(state.meta.unlocked||[]); let changed=false;
    defs.forEach(d=>{if(!unlocked.has(d.id)&&d.test(state)){unlocked.add(d.id);changed=true;if(notify&&window.CGApp)CGApp.toast(`成就解锁：${d.title}`,`${d.icon} ${d.desc}`)}});
    if(changed){state.meta.unlocked=[...unlocked];CGStorage.saveMeta(state.meta)}
  }
  function render(state){
    const unlocked=new Set(state.meta.unlocked||[]);
    return defs.map(d=>`<div class="achievement ${unlocked.has(d.id)?'unlocked':''}"><div class="achievement-icon">${d.icon}</div><div><h3>${CGUtils.esc(d.title)}</h3><p>${CGUtils.esc(d.desc)}</p></div></div>`).join('');
  }
  window.CGAchievements={defs,check,render};
})();
