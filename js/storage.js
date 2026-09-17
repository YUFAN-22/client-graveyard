(function(){
  const DATA_KEY='client_graveyard_v3';
  const LEGACY_KEY='client_graveyard_v1';
  const SETTINGS_KEY='client_graveyard_settings_v3';
  const META_KEY='client_graveyard_meta_v3';
  const memoryStore={};
  function readItem(key){try{return localStorage.getItem(key)}catch(_){return Object.prototype.hasOwnProperty.call(memoryStore,key)?memoryStore[key]:null}}
  function writeItem(key,value){try{localStorage.setItem(key,value);return true}catch(_){memoryStore[key]=String(value);return false}}

  function uid(prefix='id'){
    return (typeof crypto!=='undefined' && crypto.randomUUID) ? `${prefix}_${crypto.randomUUID()}` : `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
  }
  function today(){
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function esc(s){
    return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }
  function clamp(n,min,max){return Math.min(max,Math.max(min,n));}
  function safeJSON(raw,fallback){try{return raw?JSON.parse(raw):fallback}catch(_){return fallback}}
  function normalizeEvent(e,i=0){
    if(typeof e==='string') return {id:uid('event'),date:'',type:'其他',title:`往事 ${i+1}`,content:e,createdAt:new Date().toISOString()};
    const content=(e?.content??e?.text??'').toString();
    return {
      id:e?.id||uid('event'),
      date:e?.date||'',
      type:e?.type||'其他',
      title:e?.title||((content.split(/[。！!？?\n]/)[0]||`往事 ${i+1}`).slice(0,40)),
      content,
      createdAt:e?.createdAt||new Date().toISOString()
    };
  }
  function normalizeTraits(x){
    if(Array.isArray(x)) return [...new Set(x.map(v=>String(v).trim()).filter(Boolean))].slice(0,12);
    if(typeof x==='string') return [...new Set(x.split(/[·|｜,，/]/).map(v=>v.trim()).filter(Boolean))].slice(0,12);
    return [];
  }
  function normalizeClient(x={}){
    let events=x.events;
    if(typeof events==='string'){
      events=events.trim()?events.split('\n').filter(Boolean).map((line,i)=>{
        const m=line.match(/^(\d{4}-\d{2}-\d{2})[｜|]\s*(.*)$/);
        return normalizeEvent(m?{date:m[1],content:m[2]}:{content:line},i);
      }):[];
    }
    if(!Array.isArray(events)) events=[];
    return {
      id:x.id||uid('client'),
      name:String(x.name||'未命名甲方').slice(0,50),
      traits:normalizeTraits(x.traits??x.trait),
      burialDate:x.burialDate||x.date||today(),
      epitaph:String(x.epitaph||'').slice(0,120),
      skin:['arch','slab','obelisk'].includes(x.skin)?x.skin:'arch',
      events:events.map(normalizeEvent),
      incense:Number(x.incense||0)||0,
      poop:Number(x.poop||0)||0,
      createdAt:x.createdAt||new Date().toISOString(),
      lastViewedAt:x.lastViewedAt||null,
      lastIncenseAt:x.lastIncenseAt||null,
      lastPoopAt:x.lastPoopAt||null,
      viewCount:Number(x.viewCount||0)||0,
      stoneClicks:Number(x.stoneClicks||0)||0,
      incenseSincePoop:Number(x.incenseSincePoop||0)||0
    };
  }
  function loadClients(){
    const current=safeJSON(readItem(DATA_KEY),null);
    if(Array.isArray(current)) return current.map(normalizeClient);
    const legacy=safeJSON(readItem(LEGACY_KEY),[]);
    if(Array.isArray(legacy)&&legacy.length){
      const migrated=legacy.map(normalizeClient);
      saveClients(migrated);
      return migrated;
    }
    return [];
  }
  function saveClients(clients){return writeItem(DATA_KEY,JSON.stringify(clients.map(normalizeClient)))}
  function loadSettings(){
    return Object.assign({noticeSeen:false,theme:'auto',weather:'fog',sound:false,selectedTrait:'',search:'',demoLoaded:false},safeJSON(readItem(SETTINGS_KEY),{}));
  }
  function saveSettings(settings){return writeItem(SETTINGS_KEY,JSON.stringify(settings))}
  function loadMeta(){return Object.assign({unlocked:[],rapidPoop:[],createdCount:0,lastDailyKey:''},safeJSON(readItem(META_KEY),{}))}
  function saveMeta(meta){return writeItem(META_KEY,JSON.stringify(meta))}
  function exportPayload(clients,settings,meta){
    return {app:'Client Graveyard',version:3,exportedAt:new Date().toISOString(),clients:clients.map(normalizeClient),settings:{theme:settings.theme,weather:settings.weather},meta:{unlocked:meta.unlocked||[]}};
  }
  function parseImport(text){
    const parsed=JSON.parse(text);
    const arr=Array.isArray(parsed)?parsed:parsed.clients;
    if(!Array.isArray(arr)) throw new Error('INVALID_FORMAT');
    return arr.map(normalizeClient);
  }
  function mergeClients(base,incoming){
    const ids=new Set(base.map(x=>x.id));
    return base.concat(incoming.map(x=>ids.has(x.id)?normalizeClient({...x,id:uid('client')}):x));
  }
  window.CGUtils={uid,today,esc,clamp,normalizeEvent,normalizeClient,normalizeTraits};
  window.CGStorage={DATA_KEY,LEGACY_KEY,loadClients,saveClients,loadSettings,saveSettings,loadMeta,saveMeta,exportPayload,parseImport,mergeClients,readItem,writeItem};
})();
