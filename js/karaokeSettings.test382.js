/* TEST388 — Karaoke Settings: manual tempo and start offset.
 * SAVE requests beta key and persists immediately to this browser once
 * authenticated using the already-live Community Worker.
 * Public publication is best effort, never confused with LOCAL SAVED.
 * Non-modal, draggable, compact, active palette only.
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
    feedback(sync.status().localSaved?
      'AJUSTES LOCALES RESTAURADOS · SAVE PARA ACTUALIZAR':
      'KARAOKE BPM MANUAL · SAVE PARA GUARDAR CON CLAVE');
    positionPanel();updatePlay();
    if(bpmPoll!==null)clearInterval(bpmPoll);
    bpmPoll=setInterval(function(){
      if(WRAP.hidden)return;
      updatePlay();
    },1300);
    // Public defaults may be fetched, but never overwrite local saves
    // or the numbers currently being typed by the editor.
    sync.readPublic().then(function(){
      if(ticket!==requestId||WRAP.hidden)return;
      if(!editTouched)renderPublishedValues();
      feedback(sync.status().localSaved?
        'GUARDADO LOCAL RECUPERADO · AÚN NO PUBLICADO':
        'VALORES PÚBLICOS CARGADOS · AJUSTÁ Y PULSÁ SAVE');
    }).catch(function(){
      if(ticket===requestId&&!WRAP.hidden)
        feedback(sync.status().localSaved?
          'GUARDADO LOCAL RECUPERADO · SERVIDOR PÚBLICO PENDIENTE':
          'SIN CONEXIÓN PÚBLICA · SAVE PUEDE GUARDAR LOCALMENTE');
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

  // The existing /catalog-order worker is already deployed. A deliberately
  // invalid order validates the beta key WITHOUT updating any public data.
  // Do not accept a generic HTTP 400 response: check the exact expected error.
  async function authorizeBetaKey(secret){
    var response=await fetch(backend+'/catalog-order',{
      method:'PUT',cache:'no-store',
      headers:{'Content-Type':'application/json','X-Beta-Key':secret},
      body:JSON.stringify({order:[],expectedRevision:-1})
    });
    var data=await response.json().catch(function(){return {};});
    if(response.status===403)
      throw Error('CLAVE INCORRECTA O CLAVE DEL SERVIDOR NO CONFIGURADA');
    if(response.status!==400||
       data.error!=='Invalid community order or revision')
      throw Error('NO SE PUDO VALIDAR LA CLAVE CON EL SERVIDOR');
    return true;
  }
  async function tryPublicSave(secret,values,ticket){
    // Publishing is optional until TEST385 Cloudflare deploy is enabled;
    // local values are already safely stored before attempting this.
    await sync.readPublic();
    if(ticket!==requestId||WRAP.hidden)return false;
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
    if(!response.ok||receipt.format!=='spotysid-karaoke-sync'||
       receipt.published!==true||receipt.revision!==revision+1)
      return false;
    // Independently verify the public record: do NOT equate local save
    // with publication merely because a PUT request returned 200.
    var verified=await sync.readPublic();
    if(ticket!==requestId||WRAP.hidden)return false;
    if(verified.revision!==receipt.revision||
       verified.karaokeBpm!==values.karaokeBpm||
       verified.offsetSeconds!==values.offsetSeconds)return false;
    sync.clearLocal();
    sync.applyPublic(verified);
    return true;
  }
  FORM.addEventListener('submit',async function(e){
    e.preventDefault();e.stopPropagation();
    if(busy||!hasKaraoke())return;
    var values;
    try{values=readFields();}
    catch(error){feedback(error.message);return;}
    if(AUTH.hidden){
      // TEST388: the FIRST SAVE click requests the beta key.
      AUTH.hidden=false;KEY.required=true;KEY.value='';
      SAVE.textContent='SAVE';
      feedback('INGRESÁ CLAVE BETA PARA GUARDAR LOCALMENTE');
      positionPanel();KEY.focus();
      return;
    }
    var secret=KEY.value;
    if(!secret){feedback('INGRESÁ LA CLAVE BETA');KEY.focus();return;}
    busy=true;SAVE.disabled=true;
    var ticket=++requestId;
    feedback('VERIFICANDO CLAVE…');
    try{
      await authorizeBetaKey(secret);
      if(ticket!==requestId||WRAP.hidden)return;
      // The local commit is guaranteed before attempting global publication.
      // This also updates the active lyrics immediately without changing SID audio.
      sync.saveLocal(values);
      discardKeyPrompt();editTouched=false;renderPublishedValues();
      feedback('GUARDADO LOCAL · BPM '+values.karaokeBpm+
        ' · INICIO '+(values.offsetSeconds>0?'+':'')+values.offsetSeconds+
        ' S · PUBLICACIÓN PENDIENTE');
      // Never erase local settings if the public route is not deployed.
      // The same authorized request is used if the public route exists.
      try{
        var published=await tryPublicSave(secret,values,ticket);
        if(ticket===requestId&&!WRAP.hidden){
          if(published){
            renderPublishedValues();
            feedback('PUBLICADO PARA TODOS · BPM '+values.karaokeBpm+
              ' · INICIO '+(values.offsetSeconds>0?'+':'')+
              values.offsetSeconds+' S');
          }else feedback('GUARDADO LOCAL · PUBLICACIÓN PENDIENTE');
        }
      }catch(publishError){
        if(ticket===requestId&&!WRAP.hidden)
          feedback('GUARDADO LOCAL · PUBLICACIÓN PENDIENTE');
      }
    }catch(error){
      if(ticket===requestId&&!WRAP.hidden){
        feedback('NO GUARDADO · '+error.message);
        KEY.focus();
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
    feedback('ORIGINAL PREPARADO · SAVE PARA GUARDAR CON CLAVE');
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