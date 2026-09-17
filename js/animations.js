(function(){
  let audioCtx=null, windSource=null, windGain=null;
  function random(list){return list[Math.floor(Math.random()*list.length)]}
  function centerOf(el){const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height*.56}}
  function messageAt(text,x,y){
    const n=document.createElement('div'); n.className='reaction-message'; n.textContent=text;
    n.style.left=`${x}px`; n.style.top=`${Math.max(36,y-90)}px`; document.getElementById('effectLayer').appendChild(n);
    setTimeout(()=>n.remove(),5400);
  }
  function incense(targetEl,line){
    const p=centerOf(targetEl), layer=document.getElementById('effectLayer');
    const fx=document.createElement('div');fx.className='incense-effect';fx.innerHTML='<span class="effect-candle"></span>';fx.style.left=`${p.x}px`;fx.style.top=`${p.y+30}px`;layer.appendChild(fx);
    messageAt(line||random(CGContent.INCENSE_LINES),p.x,p.y);
    ping(520,.08,.13); setTimeout(()=>fx.remove(),5400);
  }
  function poop(targetEl,line){
    const p=centerOf(targetEl), layer=document.getElementById('effectLayer');
    const fx=document.createElement('div');fx.className='poop-effect';fx.innerHTML='<span class="effect-poop"></span>';
    const sx=Math.max(10,window.innerWidth*.12), sy=window.innerHeight+50;
    const tx=p.x-sx, ty=p.y-sy;
    fx.style.left=`${sx}px`;fx.style.top=`${sy}px`;fx.style.setProperty('--sx','0px');fx.style.setProperty('--sy','0px');fx.style.setProperty('--tx',`${tx}px`);fx.style.setProperty('--ty',`${ty}px`);
    layer.appendChild(fx); setTimeout(()=>{fx.classList.add('poop-landed');targetEl.classList.add('shake');thud();setTimeout(()=>targetEl.classList.remove('shake'),420);messageAt(line||random(CGContent.POOP_LINES),p.x,p.y)},950);
    setTimeout(()=>fx.remove(),5500);
  }
  function ensureAudio(){audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}
  function ping(freq=440,vol=.05,dur=.12){
    try{const c=ensureAudio(),o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.value=freq;g.gain.setValueAtTime(vol,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+dur);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+dur)}catch(_){ }
  }
  function thud(){try{const c=ensureAudio(),o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.setValueAtTime(95,c.currentTime);o.frequency.exponentialRampToValueAtTime(42,c.currentTime+.16);g.gain.setValueAtTime(.12,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.2);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.2)}catch(_){ }}
  function startAmbient(){
    try{const c=ensureAudio(); if(windSource)return; const len=c.sampleRate*2, buffer=c.createBuffer(1,len,c.sampleRate), data=buffer.getChannelData(0);let last=0;for(let i=0;i<len;i++){const white=Math.random()*2-1;last=(last*.985)+(white*.015);data[i]=last*.9}windSource=c.createBufferSource();windSource.buffer=buffer;windSource.loop=true;windGain=c.createGain();windGain.gain.value=.035;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=650;windSource.connect(filter).connect(windGain).connect(c.destination);windSource.start()}catch(_){ }
  }
  function stopAmbient(){try{if(windSource){windSource.stop();windSource.disconnect();windSource=null}if(windGain){windGain.disconnect();windGain=null}}catch(_){ }}
  function setAmbient(on){on?startAmbient():stopAmbient()}
  window.CGAnimations={incense,poop,setAmbient,ping};
})();
