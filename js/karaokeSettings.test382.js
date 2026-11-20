/* TEST383 — non-modal floating Karaoke Settings, theme-colored and movable.
 * Authentication reuses the existing Cloudflare beta-key protected validation.
 * Intentional invalid catalog-order validation cannot alter public state.
 * Password is NEVER stored; BPM and offset remain local per registered SID.
 */
(function(){
  'use strict';
  var el=function(id){return document.getElementById(id);};
  var OPEN=el('ricoKaraokeSettings'),WRAP=el('ricoKaraokeConfigOverlay'),
    FORM=el('ricoKaraokeConfigForm'),TITLE=el('ricoKaraokeConfigTitle'),
    KEY=el('ricoKaraokeBetaKey'),AUTH=el('ricoKaraokeAuthBlock'),
    FIELDS=el('ricoKaraokeAdjustmentFields'),
    BPM=el('ricoKaraokeBpm'),SIDBPM=el('ricoKaraokeSidBpm'),
    OFFSET=el('ricoKaraokeOffset'),SONG=el('ricoKaraokeConfigSong'),
    STATUS=el('ricoKaraokeConfigStatus'),CLOSE=el('ricoKaraokeConfigCancel'),
    SAVE=el('ricoKaraokeConfigSave'),RESET=el('ricoKaraokeConfigReset'),
    PLAY=el('ricoKaraokeConfigPlay');
  var kara=window.SpotySidKaraoke,sync=window.SpotySidKaraokeSync,
    data=window.SpotySidKaraokeMidi,player=window.sidPlayer;
  if(!OPEN||!WRAP||!FORM||!TITLE||!KEY||!AUTH||!FIELDS||!BPM||!SIDBPM||
    !OFFSET||!SONG||!STATUS||!CLOSE||!SAVE||!RESET||!PLAY||
    !kara||!sync||!data||!player)return;

  var authorized=false,busy=false,drag=null,lastPosition=null,authTicket=0,bpmPoll=null;
  var baseBpm=Number(data.karaokeBpm)||Math.round(60/data.secondsPerBeat)||108;
  var backend='https://ricos-sid-community.serigrafiamdp.workers.dev';
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function activeEntry(){
    var i=player.sidListIndex;
    return typeof i==='number'&&player.sidList?player.sidList[i]:null;
  }
  function hasKaraoke(){
    var item=activeEntry(),ref=item&&item._hvscRef;
    return !!(item&&((ref&&ref.pack===data.sidPack&&ref.file===data.sidFile)||
      (item.file===data.sidFile&&/uctumi|palladino/i.test(String(item.author||'')))));
  }
  function feedback(message){STATUS.textContent=message||'';}
  function updatePlay(){
    PLAY.textContent=player.isPlaying?'PAUSE':'PLAY';
    PLAY.setAttribute('aria-label',player.isPlaying?'Pause SID':'Play SID');
  }
  function fit(left,top){
    var w=FORM.offsetWidth||314,h=FORM.offsetHeight||160;
    left=clamp(left,4,Math.max(4,window.innerWidth-w-4));
    top=clamp(top,4,Math.max(4,window.innerHeight-h-4));
    FORM.style.left=Math.round(left)+'px';
    FORM.style.top=Math.round(top)+'px';
    lastPosition={left:left,top:top};
  }
  function positionPanel(){
    if(lastPosition){fit(lastPosition.left,lastPosition.top);return;}
    fit(window.innerWidth-FORM.offsetWidth-15,Math.max(12,window.innerHeight*.31));
  }
  TITLE.addEventListener('pointerdown',function(e){
    if(WRAP.hidden||e.button!==0)return;
    var rect=FORM.getBoundingClientRect();
    drag={id:e.pointerId,x:e.clientX-rect.left,y:e.clientY-rect.top};
    TITLE.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  TITLE.addEventListener('pointermove',function(e){
    if(!drag||drag.id!==e.pointerId)return;
    fit(e.clientX-drag.x,e.clientY-drag.y);
  });
  function stopDrag(e){
    if(!drag||e.pointerId!==drag.id)return;
    drag=null;
    if(TITLE.hasPointerCapture(e.pointerId))TITLE.releasePointerCapture(e.pointerId);
  }
  TITLE.addEventListener('pointerup',stopDrag);
  TITLE.addEventListener('pointercancel',stopDrag);
  window.addEventListener('resize',function(){if(!WRAP.hidden)positionPanel();});

  function refreshSidBpm(){
    // Estimate is computed from the running SID sound, never from the
    // total SID song length (which can contain an extra instrumental tail).
    var estimate=kara&&typeof kara.estimateSidBpm==='function'
      ?kara.estimateSidBpm():null;
    if(Number.isFinite(estimate)&&estimate>0)
      SIDBPM.textContent='≈ '+estimate;
    else if(Number.isFinite(data.sidBpmApprox)&&data.sidBpmApprox>0)
      SIDBPM.textContent='≈ '+data.sidBpmApprox;
    else SIDBPM.textContent='SIN MEDIR';
  }
  function renderValues(){
    var setting=sync.get();
    BPM.value=String(Math.round(baseBpm*setting.speed*10)/10);
    OFFSET.value=String(setting.offsetSeconds);
    refreshSidBpm();
  }
  function close(){
    ++authTicket;
    if(bpmPoll!==null){clearInterval(bpmPoll);bpmPoll=null;}
    WRAP.hidden=true;
    authorized=false;busy=false;drag=null;
    KEY.value='';KEY.required=true;
    AUTH.hidden=false;FIELDS.hidden=true;
    feedback('');
  }
  function open(){
    if(!kara.isActive())return;
    ++authTicket;
    WRAP.hidden=false;authorized=false;busy=false;
    KEY.value='';KEY.required=true;
    AUTH.hidden=false;FIELDS.hidden=true;
    SAVE.textContent='VERIFY';
    SONG.textContent=data.title+' — '+data.originalArtist+' / '+data.sidCoverBy;
    renderValues();
    KEY.disabled=!hasKaraoke();
    feedback(hasKaraoke()?'BETA KEY REQUIRED':'NO KARAOKE DATA FOR THIS SID');
    positionPanel();
    updatePlay();
    if(bpmPoll!==null)clearInterval(bpmPoll);
    bpmPoll=setInterval(function(){
      if(WRAP.hidden)return;
      refreshSidBpm();
      updatePlay();
    },1300);
    if(!KEY.disabled)KEY.focus();
  }
  OPEN.addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();
    if(WRAP.hidden)open();else close();
  });
  CLOSE.addEventListener('click',function(e){e.preventDefault();close();});
  // This window is deliberately NOT modal: clicks outside are delivered
  // to the Karaoke, playlist, player and keyboard shortcuts behind it.
  FORM.addEventListener('mousedown',function(e){e.stopPropagation();});
  ['keydown','keyup','keypress'].forEach(function(t){
    FORM.addEventListener(t,function(e){
      if(e.target.closest('input,select,textarea'))e.stopPropagation();
    });
  });
  PLAY.addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();
    var button=el('playButton');
    if(button&&!button.disabled)button.click();
    updatePlay();
  });
  // The normal playback button may also be used while this window is open.
  el('playButton').addEventListener('click',function(){
    if(!WRAP.hidden)Promise.resolve().then(updatePlay);
  });
  async function validateBetaKey(key){
    // Authentication happens in the deployed Worker. The deliberately
    // invalid payload can never mutate the public catalog.
    var response=await fetch(backend+'/catalog-order',{
      method:'PUT',headers:{'Content-Type':'application/json','X-Beta-Key':key},
      body:JSON.stringify({order:[],expectedRevision:-1}),
      cache:'no-store'
    });
    var receipt=await response.json().catch(function(){return {};});
    return response.status===400&&
      receipt.error==='Invalid community order or revision';
  }
  function saveValues(){
    if(!authorized||!hasKaraoke())return false;
    var bpm=Number(BPM.value),offset=Number(OFFSET.value);
    if(!Number.isFinite(bpm)||bpm<65||bpm>150||
      !Number.isFinite(offset)||offset< -30||offset>30){
      feedback('KARAOKE BPM 65–150 · INICIO ±30 S');
      return false;
    }
    sync.set({speed:bpm/baseBpm,offsetSeconds:offset});
    feedback('GUARDADO PARA ESTE KARAOKE');
    return true;
  }
  FORM.addEventListener('submit',async function(e){
    e.preventDefault();e.stopPropagation();
    if(busy||!hasKaraoke())return;
    if(authorized){saveValues();return;}
    var secret=KEY.value;
    KEY.value='';
    if(!secret){feedback('INGRESAR CLAVE BETA');return;}
    var mine=++authTicket;
    busy=true;
    feedback('VERIFICANDO CLAVE…');
    try{
      var valid=await validateBetaKey(secret);
      if(mine!==authTicket||WRAP.hidden)return;
      if(!valid){feedback('CLAVE INVALIDA / SERVIDOR NO DISPONIBLE');return;}
      authorized=true;
      KEY.required=false;
      AUTH.hidden=true;FIELDS.hidden=false;
      SAVE.textContent='SAVE';
      feedback('AJUSTES HABILITADOS');
      positionPanel();
    }catch(err){
      if(mine===authTicket&&!WRAP.hidden)feedback('NO SE PUDO VERIFICAR LA CLAVE');
    }finally{if(mine===authTicket)busy=false;}
  });
  RESET.addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();
    if(!authorized||!hasKaraoke())return;
    sync.reset();renderValues();feedback('SINCRONIZACION ORIGINAL RESTAURADA');
  });
  document.addEventListener('keydown',function(e){
    if(WRAP.hidden||e.key!=='Escape')return;
    e.preventDefault();e.stopImmediatePropagation();close();
  },true);
  // Close an authorized session as soon as Karaoke closes or switches.
  var originalClose=kara.close,originalOpen=kara.open;
  kara.close=function(){
    if(!WRAP.hidden)close();
    return originalClose.apply(this,arguments);
  };
  kara.open=function(){
    if(!WRAP.hidden)close();
    return originalOpen.apply(this,arguments);
  };
})();