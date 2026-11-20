/* TEST385 — Karaoke Settings: edit first, SAVE asks beta key, publish
 * globally to Cloudflare D1. NO browser-only SAVE success claims.
 * Non-modal, draggable, compact, theme-only, per registered Karaoke.
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

  var backend='https://ricos-sid-community.serigrafiamdp.workers.dev';
  var baseBpm=Number(data.karaokeBpm)||Math.round(60/data.secondsPerBeat)||108;
  var requestId=0,busy=false,lastPosition=null,drag=null,bpmPoll=null;
  var editTouched=false;
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function feedback(message){STATUS.textContent=message||'';}
  function activeEntry(){
    var i=player.sidListIndex;
    return typeof i==='number'&&player.sidList?player.sidList[i]:null;
  }
  function hasKaraoke(){
    var item=activeEntry(),ref=item&&item._hvscRef;
    return !!(item&&((ref&&ref.pack===data.sidPack&&ref.file===data.sidFile)||
      (item.file===data.sidFile&&/uctumi|palladino/i.test(String(item.author||'')))));
  }
  function updatePlay(){
    PLAY.textContent=player.isPlaying&&!player.isPaused?'PAUSE':'PLAY';
    PLAY.setAttribute('aria-label',player.isPlaying&&!player.isPaused?'Pause SID':'Play SID');
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
    TITLE.setPointerCapture(e.pointerId);e.preventDefault();
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
    // Only the precomputed, per-SID value is shown here.
    // Never measure BPM during live playback; do not invent an estimate.
    var prior=Number(data.sidBpmApprox);
    SIDBPM.textContent=Number.isFinite(prior)&&prior>0?'≈ '+prior:'SIN MEDICIÓN PREVIA';
    SIDBPM.title=Number.isFinite(prior)&&prior>0?
      'Estimated before publication; not recalculated during playback':
      'Este SID todavía no tiene un análisis previo de BPM registrado';
  }
  function renderPublishedValues(){
    var x=sync.get();
    BPM.value=String(Math.round(baseBpm*x.speed*100)/100);
    OFFSET.value=String(x.offsetSeconds);
    refreshSidBpm();
  }
  function discardKeyPrompt(){
    AUTH.hidden=true;
    KEY.value='';KEY.required=false;
    SAVE.textContent='SAVE';
  }
  function close(){
    ++requestId;
    if(bpmPoll!==null){clearInterval(bpmPoll);bpmPoll=null;}
    WRAP.hidden=true;busy=false;drag=null;
    discardKeyPrompt();
    feedback('');
  }
  function open(){
    if(!kara.isActive())return;
    var ticket=++requestId;
    WRAP.hidden=false;busy=false;editTouched=false;
    AUTH.hidden=true;FIELDS.hidden=false;
    KEY.required=false;KEY.value='';
    SAVE.textContent='SAVE';
    SONG.textContent=data.title+' — '+data.originalArtist+' / '+data.sidCoverBy;
    renderPublishedValues();
    feedback('AJUSTÁ Y PULSÁ SAVE PARA PUBLICAR · NO ES GUARDADO LOCAL');
    positionPanel();updatePlay();
    if(bpmPoll!==null)clearInterval(bpmPoll);
    bpmPoll=setInterval(function(){
      if(WRAP.hidden)return;
      updatePlay();
    },1300);
    // Read public values from the database; never overwrite active typing.
    sync.readPublic().then(function(){
      if(ticket!==requestId||WRAP.hidden)return;
      if(!editTouched)renderPublishedValues();
      feedback('VALORES PÚBLICOS CARGADOS · SAVE PARA PUBLICAR CAMBIOS');
    }).catch(function(){
      if(ticket===requestId&&!WRAP.hidden)
        feedback('SERVICIO PÚBLICO NO DISPONIBLE · SAVE REINTENTARÁ');
    });
  }
  OPEN.addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();
    if(WRAP.hidden)open();else close();
  });
  CLOSE.addEventListener('click',function(e){e.preventDefault();close();});
  FORM.addEventListener('mousedown',function(e){e.stopPropagation();});
  ['keydown','keyup','keypress'].forEach(function(t){
    FORM.addEventListener(t,function(e){
      if(e.target.closest('input,select,textarea'))e.stopPropagation();
    });
  });
  [BPM,OFFSET].forEach(function(input){
    input.addEventListener('input',function(){
      editTouched=true;
      if(!AUTH.hidden)discardKeyPrompt(); // changed values need fresh SAVE intent
    });
    // Manual typing only: scrolling over a field never shifts its value.
    input.addEventListener('wheel',function(e){if(document.activeElement===input)input.blur();});
  });
  PLAY.addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();
    var button=el('playButton');
    if(button&&!button.disabled)button.click();
    updatePlay();
  });
  var playButton=el('playButton');
  if(playButton)playButton.addEventListener('click',function(){
    if(!WRAP.hidden)Promise.resolve().then(updatePlay);
  });

  function readFields(){
    // A minus sign ADVANCES lyrics, plus sign DELAYS. Tempo is independent.
    var bpmText=String(BPM.value||'').trim().replace(',','.');
    var startText=String(OFFSET.value||'').trim().replace(',','.');
    var bpm=/^[0-9]{2,3}(?:\.[0-9]{1,2})?$/.test(bpmText)?Number(bpmText):NaN;
    var offset=/^[+-]?(?:[0-9]{1,2})(?:\.[0-9]{1,2})?$/.test(startText)?Number(startText):NaN;
    if(!Number.isFinite(bpm)||bpm<65||bpm>150||
       !Number.isFinite(offset)||offset< -30||offset>30)
      throw Error('KARAOKE BPM 65–150 · INICIO -30 A +30 SEG');
    return {karaokeBpm:bpm,offsetSeconds:offset};
  }

  FORM.addEventListener('submit',async function(e){
    e.preventDefault();e.stopPropagation();
    if(busy||!hasKaraoke())return;
    var values;
    try{values=readFields();}
    catch(err){feedback(err.message);return;}
    if(AUTH.hidden){
      // TEST385: this is the FIRST moment the beta key is requested.
      AUTH.hidden=false;KEY.required=true;KEY.value='';
      SAVE.textContent='PUBLISH';
      feedback('INGRESÁ CLAVE BETA Y PULSÁ PUBLISH · CAMBIO GLOBAL');
      positionPanel();KEY.focus();
      return;
    }
    var secret=KEY.value;
    if(!secret){feedback('INGRESÁ LA CLAVE BETA PARA PUBLICAR');KEY.focus();return;}
    KEY.value=''; // the secret is only held in this request
    busy=true;SAVE.disabled=true;
    var ticket=++requestId;
    feedback('PUBLICANDO SINCRONIZACIÓN…');
    try{
      // Fetch latest revision; do not overwrite others' published changes.
      await sync.readPublic();
      if(ticket!==requestId||WRAP.hidden)return;
      var revision=sync.status().revision;
      var response=await fetch(backend+'/karaoke-sync',{
        method:'PUT',cache:'no-store',
        headers:{'Content-Type':'application/json','X-Beta-Key':secret},
        body:JSON.stringify({
          key:data.key,karaokeBpm:values.karaokeBpm,
          offsetSeconds:values.offsetSeconds,expectedRevision:revision
        })
      });
      var receipt=await response.json().catch(function(){return {};});
      if(!response.ok)throw Error(
        response.status===403?'CLAVE BETA INCORRECTA':
        response.status===409?'OTRO EDITOR CAMBIÓ ESTE KARAOKE · VOLVÉ A ABRIR':
        response.status===404?'SERVIDOR DE PUBLICACIÓN TODAVÍA NO DESPLEGADO':
        receipt.error||'PUBLICACIÓN RECHAZADA ('+response.status+')'
      );
      if(receipt.format!=='spotysid-karaoke-sync'||receipt.published!==true||
         receipt.revision!==revision+1)
        throw Error('EL SERVIDOR NO CONFIRMÓ EL GUARDADO');
      // No "published" success until an independent GET sees the exact
      // revision and values from D1. That GET also applies the saved timing.
      var published=await sync.readPublic();
      if(ticket!==requestId||WRAP.hidden)return;
      if(published.revision!==receipt.revision||
         published.karaokeBpm!==values.karaokeBpm||
         published.offsetSeconds!==values.offsetSeconds)
        throw Error('NO SE PUDO VERIFICAR LA PUBLICACIÓN · RECARGÁ');
      discardKeyPrompt();
      editTouched=false;
      renderPublishedValues();
      feedback('PUBLICADO PARA TODOS · BPM '+values.karaokeBpm+
        ' · INICIO '+(values.offsetSeconds>0?'+':'')+values.offsetSeconds+' S');
    }catch(error){
      if(ticket===requestId&&!WRAP.hidden){
        feedback('NO PUBLICADO / SIN CONFIRMAR · '+error.message);
        KEY.focus(); // retain unsaved fields and allow another attempt
      }
    }finally{
      secret='';
      if(ticket===requestId){busy=false;SAVE.disabled=false;}
    }
  });
  RESET.addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();
    // Reset is only a pending edit; no changes until SAVE + beta key.
    BPM.value=String(baseBpm);
    OFFSET.value='0';
    editTouched=true;
    discardKeyPrompt();
    feedback('ORIGINAL PREPARADO · PULSÁ SAVE PARA PUBLICAR');
  });
  document.addEventListener('keydown',function(e){
    if(WRAP.hidden||e.key!=='Escape')return;
    e.preventDefault();e.stopImmediatePropagation();
    if(!AUTH.hidden){discardKeyPrompt();feedback('PUBLICACIÓN CANCELADA');}
    else close();
  },true);
  // Opening another Karaoke or leaving the view closes any authorization
  // attempt. It never persists a draft or cached beta key.
  var originalClose=kara.close,originalOpen=kara.open;
  kara.close=function(){if(!WRAP.hidden)close();return originalClose.apply(this,arguments);};
  kara.open=function(){if(!WRAP.hidden)close();return originalOpen.apply(this,arguments);};
})();