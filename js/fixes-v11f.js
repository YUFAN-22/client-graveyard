/* Arcade Pixel v1.1f hotfixes */
(function(){
  try{
    const key='client_graveyard_settings_v3';
    const raw=localStorage.getItem(key);
    const settings=raw?JSON.parse(raw):{};
    if(settings.weather==='fog'||!['clear','rain'].includes(settings.weather)){
      settings.weather='clear';
      localStorage.setItem(key,JSON.stringify(settings));
    }
  }catch(_){/* keep app boot resilient */}

  const fogOption=document.querySelector('#weatherSelect option[value="fog"]');
  if(fogOption)fogOption.remove();
  document.querySelectorAll('.fog').forEach(el=>el.remove());
  if(document.body.dataset.weather==='fog')document.body.dataset.weather='clear';
})();
