/* TEST382 — Karaoke Settings (one song at a time).
 * Read-only auth probe: invalid catalog-order payload is deliberately
 * rejected (400) AFTER the existing Cloudflare Worker checks X-Beta-Key.
 * A 400 with the exact expected validation error proves the key works,
 * without ever sending a valid write or changing playlist order.
 * No beta key stored, no backend mutation, no edit UI until authenticated.
 */
(function(){
  'use strict';
  var ROOT=document.getElementById('ricoKaraokeStage');
  var OPEN=document.getElementById('ricoKaraokeSettings');
  var MODE=document.getElementById('ricoKaraokeConfigOverlay');
  var FORM=document.getElementById('ricoKaraokeConfigForm');
  var KEY=document.getElementById('ricoKaraokeBetaKey');
  var KEYGROUP=document.getElementById('ricoKaraokeAuthBlock');
  var FIELDS=document.getElementById('ricoKaraokeAdjustmentFields');
  var SPEED=document.getElementById('ricoKaraokeSpeed');
  var SPEED_TEXT=document.getElementById('ricoKaraokeSpeedText');
  var OFFSET=document.getElementById('ricoKaraokeOffset');
  var SONG=document.getElementById('ricoKaraokeConfigSong');
  var STATUS=document.getElementById('ricoKaraokeConfigStatus');
  var CANCEL=document.getElementById('ricoKaraokeConfigCancel');
  var RESET=document.getElementById('ricoKaraokeConfigReset');
  var sync=window.SpotySidKaraokeSync, karaoke=window.SpotySidKaraoke;
  var data=window.SpotySidKaraokeMidi;
  if(!ROOT||!OPEN||!MODE||!FORM||!KEY||!FIELDS||!SPEED||!OFFSET||
    !CANCEL||!RESET||!sync||!karaoke||!data)return;

  var api='https://ricos-sid-community.serigrafiamdp.workers.dev';
  var authorized=false, busy=false;
  var songKey=data.key;
  function showStatus(s){STATUS.textContent=s||'';}
  function selectedSong(){
    var player=window.sidPlayer;
    var index=player&&player.sidListIndex;
    return player&&typeof index==='number'&&player.sidList&&player.sidList[index];
  }
  function supported(){
    var item=selectedSong();
    return !!(item&&((item._hvscRef&&item._hvscRef.file===data.sidFile&&
      item._hvscRef.pack===data.sidPack)||
      (item.file===data.sidFile&&/uctumi|palladino/i.test(item.author||''))));
  }
  function refreshLabels(){
    SPEED_TEXT.textContent=(Number(SPEED.value)*100).toFixed(1)+'%';
  }
  function refreshControls(){
    var x=sync.get();
    SPEED.value=String(x.speed);
    OFFSET.value=String(x.offsetSeconds);
    refreshLabels();
  }
  function close(){
    MODE.hidden=true;
    authorized=false;busy=false;
    KEY.value='';
    KEYGROUP.hidden=false;FIELDS.hidden=true;
    showStatus('');
  }
  function open(){
    if(!karaoke.isActive())return;
    MODE.hidden=false;
    authorized=false;busy=false;
    KEYGROUP.hidden=false;FIELDS.hidden=true;
    KEY.value='';
    SONG.textContent=data.title+' — '+data.originalArtist+' / COVER SID BY '+data.sidCoverBy;
    showStatus(supported()?'BETA KEY REQUIRED':'No synchronized karaoke data for this song.');
    refreshControls();
    KEY.disabled=!supported();
    if(supported())KEY.focus();
  }
  OPEN.addEventListener('click',function(event){
    event.stopPropagation();
    if(MODE.hidden)open();else close();
  });
  CANCEL.addEventListener('click',close);
  MODE.addEventListener('mousedown',function(event){event.stopPropagation();});
  MODE.addEventListener('click',function(event){if(event.target===MODE)close();});
  SPEED.addEventListener('input',refreshLabels);

  async function validateKey(secret){
    // This pre-existing server validation route does not accept empty orders.
    // If authorization is rejected, response is 403. Authorized request is
    // guaranteed to fail validation with 400; no write path can be reached.
    var response=await fetch(api+'/catalog-order',{
      method:'PUT',
      headers:{'Content-Type':'application/json','X-Beta-Key':secret},
      body:JSON.stringify({order:[],expectedRevision:-1}),
      cache:'no-store'
    });
    var answer=await response.json().catch(function(){return {};});
    return response.status===400&&
      answer.error==='Invalid community order or revision';
  }
  FORM.addEventListener('submit',async function(event){
    event.preventDefault();event.stopPropagation();
    if(busy||!supported())return;
    if(!authorized){
      var supplied=KEY.value;
      KEY.value='';
      if(!supplied){showStatus('Enter beta key.');return;}
      busy=true;
      showStatus('VERIFYING BETA KEY…');
      try{
        var passed=await validateKey(supplied);
        if(!passed){
          showStatus('INVALID KEY OR SERVER AUTH UNAVAILABLE');
          return;
        }
        authorized=true;
        KEYGROUP.hidden=true;FIELDS.hidden=false;
        showStatus('AUTHORIZED · LOCAL SETTINGS FOR THIS SONG');
        refreshControls();
        SPEED.focus();
      }catch(e){
        showStatus('CANNOT CONTACT BETA AUTH SERVER');
      }finally{
        busy=false;
      }
      return;
    }
    if(!authorized||!supported())return;
    var speed=Number(SPEED.value),offset=Number(OFFSET.value);
    if(!Number.isFinite(speed)||speed<.8||speed>1.2||
      !Number.isFinite(offset)||offset< -30||offset>30){
      showStatus('SPEED 80–120%, OFFSET ±30 SECONDS');
      return;
    }
    sync.set({speed:speed,offsetSeconds:offset});
    showStatus('SAVED LOCALLY · '+songKey);
    close();
  });
  RESET.addEventListener('click',function(){
    if(!authorized||!supported())return;
    sync.reset();
    refreshControls();
    showStatus('RESTORED ORIGINAL CALIBRATION');
  });
  document.addEventListener('keydown',function(e){
    if(MODE.hidden)return;
    if(e.key==='Escape'){
      e.preventDefault();e.stopImmediatePropagation();close();
    }
  },true);
  var oldClose=karaoke.close;
  karaoke.close=function(){if(!MODE.hidden)close();return oldClose.apply(this,arguments);};
  // A different SID must never inherit an open/authorized editor session.
  var oldOpen=karaoke.open;
  karaoke.open=function(item,index){
    if(!MODE.hidden)close();
    return oldOpen.apply(this,arguments);
  };
})();
