(function(){
  const state={clients:[],settings:{},meta:{},route:'graveyard',routeId:null,confirmAction:null};
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

  function save(){CGStorage.saveClients(state.clients);CGStorage.saveSettings(state.settings);CGStorage.saveMeta(state.meta)}
  function toast(title,detail=''){const n=document.createElement('div');n.className='toast';n.innerHTML=`<strong>${CGUtils.esc(title)}</strong>${detail?`<small>${CGUtils.esc(detail)}</small>`:''}`;$('#toastLayer').appendChild(n);setTimeout(()=>n.remove(),4200)}
  function openModal(id){const m=$(id);if(m){m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}}
  function closeModal(id){const m=$(id);if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true');if(!$('.modal.open'))document.body.style.overflow=''}}
  function confirmAction(text,fn,yes='确认'){state.confirmAction=fn;$('#confirmText').textContent=text;$('#confirmYes').textContent=yes;openModal('#confirmModal')}

  function applyScene(){
    let theme=state.settings.theme||'auto';if(theme==='auto'){const h=new Date().getHours();theme=(h>=7&&h<18)?'day':'night'}
    document.body.dataset.theme=theme;document.body.dataset.weather=state.settings.weather||'fog';$('#themeSelect').value=state.settings.theme||'auto';$('#weatherSelect').value=state.settings.weather||'fog';
  }
  function updateHud(){
    const graves=state.clients.length,incense=state.clients.reduce((n,c)=>n+(c.incense||0),0),poop=state.clients.reduce((n,c)=>n+(c.poop||0),0);
    const g=$('#hudGraves'),i=$('#hudIncense'),p=$('#hudPoop');
    if(g)g.textContent=String(graves).padStart(2,'0');if(i)i.textContent=String(incense).padStart(3,'0');if(p)p.textContent=String(poop).padStart(3,'0');
  }
  function parseRoute(){const raw=(location.hash||'#graveyard').slice(1);if(raw.startsWith('client/'))return ['profile',decodeURIComponent(raw.split('/')[1]||'')];if(raw==='stats')return ['stats',null];return ['graveyard',null]}
  function renderRoute(){
    updateHud();
    const [route,id]=parseRoute();state.route=route;state.routeId=id;$$('.view').forEach(v=>v.hidden=true);
    if(route==='profile'){$('#profileView').hidden=false;const c=state.clients.find(x=>x.id===id);if(c){c.lastViewedAt=new Date().toISOString();c.viewCount=(c.viewCount||0)+1;CGStorage.saveClients(state.clients)}CGProfile.render(state,id);window.scrollTo(0,0)}
    else if(route==='stats'){$('#statsView').hidden=false;CGGraveyard.renderStats(state);window.scrollTo(0,0)}
    else{$('#graveyardView').hidden=false;CGGraveyard.render(state)}
  }
  function refresh(){CGAchievements.check(state);renderRoute()}

  function selectedTraits(){return $$('#traitPicker .trait-option.active').map(b=>b.dataset.trait)}
  function renderTraitPicker(selected=[]){
    const all=[...new Set([...CGContent.TRAITS,...selected])];$('#traitPicker').innerHTML=all.map(t=>`<button type="button" class="trait-option ${selected.includes(t)?'active':''}" data-trait="${CGUtils.esc(t)}">${CGUtils.esc(t)}</button>`).join('')
  }
  function renderClientPreview(){
    const box=$('#clientPreview');if(!box)return;
    const id=$('#clientId')?.value||'preview-client', existing=id!=='preview-client'?state.clients.find(x=>x.id===id):null;
    const client={id:'preview-client',name:$('#clientName')?.value.trim()||'甲方代号',traits:selectedTraits(),burialDate:$('#burialDate')?.value||CGUtils.today(),skin:$('#stoneSkin')?.value||'arch',incense:existing?.incense||0,poop:existing?.poop||0,events:[]};
    box.innerHTML=`<div class="grave-stage">${CGGraveyard.stoneMarkup(client)}</div>`;
  }
  function openClientEditor(id=null){
    const c=id?state.clients.find(x=>x.id===id):null;$('#clientModalTitle').textContent=c?'编辑甲方档案':'建立墓碑';$('#clientId').value=c?.id||'';$('#clientName').value=c?.name||'';$('#burialDate').value=c?.burialDate||CGUtils.today();$('#epitaph').value=c?.epitaph||'';$('#stoneSkin').value=c?.skin||'arch';renderTraitPicker(c?.traits||[]);$('#eventRows').innerHTML='';(c?.events?.length?c.events:[{}]).forEach(e=>$('#eventRows').appendChild(CGContent.makeEventRow(e)));renderClientPreview();openModal('#clientModal');setTimeout(()=>$('#clientName').focus(),30)
  }
  function saveClientForm(ev){
    ev.preventDefault();const id=$('#clientId').value,name=$('#clientName').value.trim();if(!name)return;
    const existing=id?state.clients.find(x=>x.id===id):null;const client=CGUtils.normalizeClient({
      ...(existing||{}),id:id||CGUtils.uid('client'),name,traits:selectedTraits(),burialDate:$('#burialDate').value||CGUtils.today(),epitaph:$('#epitaph').value.trim(),skin:$('#stoneSkin').value,events:CGContent.collectEventRows($('#eventRows')),createdAt:existing?.createdAt||new Date().toISOString()
    });
    if(existing){Object.assign(existing,client);toast('档案已更新',`${name} 的记录已经保存。`)}else{state.clients.push(client);state.meta.createdCount=(state.meta.createdCount||0)+1;toast('立碑完成',`${name} 已经进入墓园。`);if(state.clients.length===10)toast('彩蛋','系统检测到问题可能不全在甲方。')}
    save();closeModal('#clientModal');location.hash=`#client/${encodeURIComponent(client.id)}`;CGAchievements.check(state);
  }

  function openEventEditor(clientId,eventId=null){
    const c=state.clients.find(x=>x.id===clientId),e=c?.events.find(x=>x.id===eventId);if(!c)return;$('#eventModalTitle').textContent=e?'编辑往事':'记录一件往事';$('#eventClientId').value=clientId;$('#eventId').value=e?.id||'';$('#eventDate').value=e?.date||CGUtils.today();$('#eventType').innerHTML=CGContent.typeOptions(e?.type||'其他');$('#eventTitle').value=e?.title||'';$('#eventContent').value=e?.content||'';openModal('#eventModal');setTimeout(()=>$('#eventTitle').focus(),30)
  }
  function saveSingleEvent(ev){
    ev.preventDefault();const c=state.clients.find(x=>x.id===$('#eventClientId').value);if(!c)return;const id=$('#eventId').value;const event=CGUtils.normalizeEvent({id:id||CGUtils.uid('event'),date:$('#eventDate').value,type:$('#eventType').value,title:$('#eventTitle').value.trim(),content:$('#eventContent').value.trim(),createdAt:new Date().toISOString()});if(id){const old=c.events.find(x=>x.id===id);Object.assign(old,event)}else c.events.push(event);save();closeModal('#eventModal');refresh();toast('往事已记录','经验留在这里，下次少踩一个坑。')
  }

  function react(id,type,button){
    const c=state.clients.find(x=>x.id===id);if(!c)return;const target=(button.closest('.grave-plot')||button.closest('.profile-hero'))?.querySelector(`[data-client-stone="${CSS.escape(id)}"]`)||$(`[data-client-stone="${CSS.escape(id)}"]`);if(!target)return;
    if(type==='incense'){c.incense++;c.incenseSincePoop=(c.incenseSincePoop||0)+1;c.lastIncenseAt=new Date().toISOString();CGAnimations.incense(target)}else{c.poop++;c.incenseSincePoop=0;c.lastPoopAt=new Date().toISOString();CGAnimations.poop(target);const now=Date.now();state.meta.rapidPoop=(state.meta.rapidPoop||[]).filter(t=>now-t<12000);state.meta.rapidPoop.push(now);if(state.meta.rapidPoop.length>=20){toast('差不多得了。','系统建议先保存体力处理下一单。');state.meta.rapidPoop=[]}}
    save();CGAchievements.check(state);setTimeout(()=>renderRoute(),1100)
  }

  function deleteClient(id){const c=state.clients.find(x=>x.id===id);if(!c)return;confirmAction(`确定要彻底超度「${c.name}」吗？甲方资料、事件、蜡烛和大便记录都会永久删除。`,()=>{state.clients=state.clients.filter(x=>x.id!==id);save();location.hash='#graveyard';if(!state.clients.length)toast('你终于放下了。','墓园现在空空如也。')},'确认超度')}
  function deleteEvent(clientId,eventId){const c=state.clients.find(x=>x.id===clientId),e=c?.events.find(x=>x.id===eventId);if(!c||!e)return;confirmAction(`删除「${e.title}」这条往事吗？`,()=>{c.events=c.events.filter(x=>x.id!==eventId);save();refresh()},'删除事件')}

  function exportData(){const payload=CGStorage.exportPayload(state.clients,state.settings,state.meta),blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`甲方墓园备份_${CGUtils.today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);toast('备份已导出','JSON 文件只包含你的本地墓园数据。')}
  function importData(file){if(!file)return;const r=new FileReader();r.onload=()=>{try{const incoming=CGStorage.parseImport(r.result);confirmAction(`检测到 ${incoming.length} 条记录。是否与当前墓园合并？`,()=>{state.clients=CGStorage.mergeClients(state.clients,incoming);save();refresh();toast('导入完成',`已合并 ${incoming.length} 条记录。`)},'合并导入')}catch(_){toast('导入失败','文件格式不是可识别的甲方墓园备份。')}$('#importFile').value=''};r.readAsText(file)}
  function downloadSample(){const sample=[CGUtils.normalizeClient({name:'示例甲方',traits:['需求不明确','临时加需求'],burialDate:CGUtils.today(),epitaph:'需求虽逝，修改意见永存。',events:[{date:CGUtils.today(),type:'咨询',title:'第一次咨询',content:'这是示例数据，可以安全删除。'}]})];const blob=new Blob([JSON.stringify({version:3,clients:sample},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='client-graveyard-demo.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
  function clearAll(){confirmAction('确定清空全部墓园数据吗？这个操作不可恢复，建议先导出备份。',()=>{state.clients=[];save();location.hash='#graveyard';refresh();toast('你终于放下了。','所有墓碑已经离开墓园。')},'清空全部')}

  function shareCard(id){
    const c=state.clients.find(x=>x.id===id);if(!c)return;const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=675;const x=canvas.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#0d140f';x.fillRect(0,0,1200,675);x.fillStyle='#263a29';x.fillRect(0,390,1200,285);x.strokeStyle='#61705c';x.lineWidth=8;x.strokeRect(34,34,1132,607);x.fillStyle='#d7bd72';x.font='bold 24px monospace';x.fillText('CLIENT GRAVEYARD · 甲方墓园',72,92);x.fillStyle='#f1eddc';x.font='bold 76px serif';x.fillText(c.name.slice(0,12),72,205);x.font='24px monospace';x.fillStyle='#b2b9a8';x.fillText((c.traits.slice(0,3).join(' · ')||'暂无特质').slice(0,32),74,252);x.fillStyle='#161b16';x.fillRect(760,170,250,330);x.fillStyle='#767e70';x.fillRect(740,150,250,330);x.fillStyle='#222922';x.font='bold 42px serif';x.textAlign='center';x.fillText('RIP',865,255);x.font='bold 32px serif';x.fillText(c.name.slice(0,8),865,322);x.font='18px monospace';x.fillText(`🕯 ${c.incense}    💩 ${c.poop}`,865,378);x.textAlign='left';x.fillStyle='#e2d8b8';x.font='30px serif';wrapText(x,`“${c.epitaph||'这里没有墓志铭，只有经验。'}”`,72,365,580,44);x.fillStyle='#9ca691';x.font='20px monospace';x.fillText(`立碑：${c.burialDate}  ·  往事：${c.events.length} 条`,72,575);x.fillText('Bury the project. Keep the lesson.',72,615);const a=document.createElement('a');a.download=`甲方墓园_${c.name.replace(/[\\/:*?"<>|]/g,'_')}.png`;a.href=canvas.toDataURL('image/png');a.click();toast('分享卡已生成','公开分享前，请检查是否包含可识别个人的信息。')
  }
  function wrapText(ctx,text,x,y,maxWidth,lineHeight){let line='';for(const ch of text){const test=line+ch;if(ctx.measureText(test).width>maxWidth&&line){ctx.fillText(line,x,y);line=ch;y+=lineHeight}else line=test}if(line)ctx.fillText(line,x,y)}

  function handleClick(ev){
    const t=ev.target.closest('[data-action],[data-open-client],[data-filter],.trait-option,.grave-stone');if(!t)return;
    if(t.matches('.trait-option')){t.classList.toggle('active');renderClientPreview();return}
    if(t.dataset.filter!==undefined){state.settings.selectedTrait=t.dataset.filter;save();CGGraveyard.render(state);return}
    if(t.dataset.openClient){location.hash=`#client/${encodeURIComponent(t.dataset.openClient)}`;return}
    const action=t.dataset.action;
    if(!action&&t.matches('.grave-stone')){const id=t.dataset.clientStone;if(id)location.hash=`#client/${encodeURIComponent(id)}`;return}
    switch(action){
      case'new-client':openClientEditor();break;case'close-client':closeModal('#clientModal');break;case'close-event':closeModal('#eventModal');break;case'open-data':openModal('#dataModal');break;case'close-data':closeModal('#dataModal');break;
      case'add-trait':{const v=$('#customTrait').value.trim();if(v){const selected=selectedTraits();if(!selected.includes(v))selected.push(v);renderTraitPicker(selected);$('#customTrait').value='';renderClientPreview()}break}
      case'random-epitaph':$('#epitaph').value=CGContent.EPITAPHS[Math.floor(Math.random()*CGContent.EPITAPHS.length)];renderClientPreview();break;
      case'add-event-row':$('#eventRows').appendChild(CGContent.makeEventRow({date:CGUtils.today(),type:'其他'}));break;case'remove-event-row':t.closest('.event-row')?.remove();break;
      case'edit-client':openClientEditor(t.dataset.id);break;case'new-event':openEventEditor(t.dataset.id);break;case'edit-event':openEventEditor(t.dataset.clientId,t.dataset.eventId);break;case'delete-event':deleteEvent(t.dataset.clientId,t.dataset.eventId);break;case'delete-client':deleteClient(t.dataset.id);break;
      case'react':react(t.dataset.id,t.dataset.type,t);break;case'share-card':shareCard(t.dataset.id);break;
      case'stone-tap':{const c=state.clients.find(x=>x.id===t.dataset.id);if(c){c.stoneClicks=(c.stoneClicks||0)+1;if(c.stoneClicks>=10){toast('这个需求其实挺简单的。','—— 某位熟悉的声音');c.stoneClicks=0}save()}break}
      case'export-data':exportData();break;case'download-sample':downloadSample();break;case'clear-data':clearAll();break;
      case'accept-notice':state.settings.noticeSeen=true;save();closeModal('#onboardingModal');break;
      case'toggle-sound':state.settings.sound=!state.settings.sound;save();CGAnimations.setAmbient(state.settings.sound);toast(state.settings.sound?'环境音已开启':'环境音已关闭',state.settings.sound?'本地生成的低音量风声，不加载外部音频。':'安静一点也很好。');break;
      case'confirm-no':state.confirmAction=null;closeModal('#confirmModal');break;
    }
  }

  function init(){
    state.clients=CGStorage.loadClients();state.settings=CGStorage.loadSettings();state.meta=CGStorage.loadMeta();
    applyScene();$('#searchInput').value=state.settings.search||'';$('#eventType').innerHTML=CGContent.typeOptions();
    document.addEventListener('click',handleClick);window.addEventListener('hashchange',renderRoute);$('#clientForm').addEventListener('submit',saveClientForm);$('#singleEventForm').addEventListener('submit',saveSingleEvent);
    $('#searchInput').addEventListener('input',e=>{state.settings.search=e.target.value;CGStorage.saveSettings(state.settings);CGGraveyard.render(state)});$('#themeSelect').addEventListener('change',e=>{state.settings.theme=e.target.value;save();applyScene()});$('#weatherSelect').addEventListener('change',e=>{state.settings.weather=e.target.value;save();applyScene()});$('#importFile').addEventListener('change',e=>importData(e.target.files[0]));
    ['clientName','burialDate','stoneSkin'].forEach(id=>$('#'+id)?.addEventListener('input',renderClientPreview));$('#stoneSkin')?.addEventListener('change',renderClientPreview);
    $('#confirmYes').addEventListener('click',()=>{const fn=state.confirmAction;state.confirmAction=null;closeModal('#confirmModal');if(fn)fn()});
    $$('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m&&m.id!=='onboardingModal')closeModal('#'+m.id)}));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){const m=$('.modal.open:not(#onboardingModal)');if(m)closeModal('#'+m.id)}});
    if(!location.hash)location.hash='#graveyard';CGAchievements.check(state,false);renderRoute();if(!state.settings.noticeSeen)setTimeout(()=>openModal('#onboardingModal'),120);
    const h=new Date().getHours();let midnightSeen=false;try{midnightSeen=sessionStorage.getItem('cg_midnight')==='1'}catch(_){midnightSeen=false}if(h<5&&!midnightSeen){try{sessionStorage.setItem('cg_midnight','1')}catch(_){ }setTimeout(()=>toast('这么晚还在想甲方？','先保存好文件，明天再说。'),900)}
  }
  window.CGApp={state,toast,refresh,openClientEditor};
  document.addEventListener('DOMContentLoaded',init);
})();
