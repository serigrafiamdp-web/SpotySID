/* TEST381 — Karaoke lyric timing from supplied MIDI, no adjustment UI.
 * The calibration module is internal and applies to the selected SID only.
 * It reads actual elapsed SID audio samples (not wall clock or animation FPS).
 * Defaults: zero start offset, 1.0 tempo scale. Changes persist locally and
 * can be updated later through the internal SpotySidKaraokeSync API.
 */
(function(){
  'use strict';
  var data=window.SpotySidKaraokeMidi;
  var karaoke=window.SpotySidKaraoke;
  var player=window.sidPlayer;
  var stage=document.getElementById('ricoKaraokeStage');
  var title=document.getElementById('ricoKaraokeTitle');
  var area=document.getElementById('ricoKaraokeLyricArea');
  var words=area&&area.querySelector('.rico-karaoke-placeholder');
  var ball=document.getElementById('ricoKaraokeBall');
  if(!data||!karaoke||!player||!stage||!words||!ball)return;

  var songKey=data.key;
  // TEST388: Public values provide defaults, but beta-authorized local saves
  // must remain useful even before the Cloudflare publication deployment.
  // Local overrides survive page reloads and are never overwritten by a GET.
  var storageKey='spotysid-karaoke-sync-v2:'+songKey;
  // Fixed initial suggestion from the prior OFFLINE SID tempo analysis.
  // The source lyric timings always retain the original 108-BPM MIDI clock.
  var initialKaraokeBpm=Number(data.initialKaraokeBpm)||
    Number(data.sidBpmApprox)||Number(data.karaokeBpm)||108;
  var calibration={offsetSeconds:0,speed:initialKaraokeBpm/
    (Number(data.karaokeBpm)||108)};
  var localSaved=false,localSavedAt=0;
  var publicRevision=0,publicStatus='loading',publicUpdatedAt=0;
  var backend='https://ricos-sid-community.serigrafiamdp.workers.dev';
  var requestedIndex=null,requestedItem=null;
  var lastLine=-99,lastPart=-99,lastMode='',lastSong=null;
  var activeSpans=[],currentLine=null,currentPart=-1;

  function clamp(n,low,high){return Math.max(low,Math.min(high,n));}
  function safeNumber(value,fallback){var n=Number(value);return Number.isFinite(n)?n:fallback;}
  function referenceBpm(){
    return Number(data.karaokeBpm)||Math.round(60/data.secondsPerBeat)||108;
  }
  function validatePublic(payload){
    return !!(payload&&payload.format==='spotysid-karaoke-sync'&&
      payload.version===1&&payload.key===songKey&&
      Number.isSafeInteger(payload.revision)&&payload.revision>=0&&
      typeof payload.offsetSeconds==='number'&&
      Number.isFinite(payload.offsetSeconds)&&
      payload.offsetSeconds>=-30&&payload.offsetSeconds<=30&&
      (payload.karaokeBpm===null||
       (typeof payload.karaokeBpm==='number'&&
        Number.isFinite(payload.karaokeBpm)&&
        payload.karaokeBpm>=65&&payload.karaokeBpm<=150)));
  }
  function restoreLocal(){
    try{
      var saved=JSON.parse(localStorage.getItem(storageKey)||'null');
      if(!saved||saved.version!==2||saved.key!==songKey||
         typeof saved.karaokeBpm!=='number'||!Number.isFinite(saved.karaokeBpm)||
         saved.karaokeBpm<65||saved.karaokeBpm>150||
         typeof saved.offsetSeconds!=='number'||!Number.isFinite(saved.offsetSeconds)||
         saved.offsetSeconds< -30||saved.offsetSeconds>30)return false;
      calibration.speed=saved.karaokeBpm/referenceBpm();
      calibration.offsetSeconds=saved.offsetSeconds;
      localSaved=true;localSavedAt=Number(saved.updatedAt)||0;
      return true;
    }catch(err){return false;}
  }
  // Restore user-entered timing immediately, before any network response.
  restoreLocal();
  function applyPublic(payload){
    if(!validatePublic(payload))throw Error('Invalid public Karaoke sync data');
    publicRevision=payload.revision;
    publicUpdatedAt=Number(payload.updatedAt)||0;
    publicStatus='ready';
    if(!localSaved){
      calibration.offsetSeconds=payload.offsetSeconds;
      calibration.speed=(payload.karaokeBpm===null?initialKaraokeBpm:payload.karaokeBpm)/referenceBpm();
      invalidate();
    }
    return window.SpotySidKaraokeSync.get();
  }
  async function fetchPublic(){
    publicStatus='loading';
    try{
      var response=await fetch(backend+'/karaoke-sync?key='+encodeURIComponent(songKey),
        {cache:'no-store'});
      if(!response.ok)throw Error('Public Karaoke service HTTP '+response.status);
      var payload=await response.json();
      applyPublic(payload);
      return payload;
    }catch(error){
      publicStatus='unavailable';
      // Do not substitute old local per-browser calibration for a published
      // edit: it could hide global values on another visitor's computer.
      throw error;
    }
  }
  // Karaoke time conversion uses the displayed SID audio sample count.
  // Negative offsetSeconds ADVANCES the lyrics; positive DELAYS them.
  // SID PCM playback is never accelerated, slowed or restarted by settings.
  window.SpotySidKaraokeSync={
    get:function(){return {offsetSeconds:calibration.offsetSeconds,speed:calibration.speed};},
    status:function(){return {
      state:publicStatus,revision:publicRevision,updatedAt:publicUpdatedAt,
      localSaved:localSaved,localSavedAt:localSavedAt,
      source:localSaved?'local':publicStatus==='ready'?'public':'default'
    };},
    readPublic:fetchPublic,
    applyPublic:applyPublic,
    saveLocal:function(values){
      // Called ONLY after the existing beta key is validated by the Worker.
      // Never persist the beta key; only BPM, offset, and song identity.
      if(!values||typeof values.karaokeBpm!=='number'||
         !Number.isFinite(values.karaokeBpm)||values.karaokeBpm<65||
         values.karaokeBpm>150||typeof values.offsetSeconds!=='number'||
         !Number.isFinite(values.offsetSeconds)||
         values.offsetSeconds< -30||values.offsetSeconds>30)
        throw Error('Invalid Karaoke settings');
      var record={version:2,key:songKey,karaokeBpm:values.karaokeBpm,
        offsetSeconds:values.offsetSeconds,updatedAt:Date.now()};
      localStorage.setItem(storageKey,JSON.stringify(record));
      calibration.speed=values.karaokeBpm/referenceBpm();
      calibration.offsetSeconds=values.offsetSeconds;
      localSaved=true;localSavedAt=record.updatedAt;
      invalidate();
      return this.get();
    },
    clearLocal:function(){
      localStorage.removeItem(storageKey);
      localSaved=false;localSavedAt=0;
    },
    set:function(values){
      // Developer-only in-memory calibration; not a publication.
      if(!values||typeof values!=='object')return this.get();
      if(Object.prototype.hasOwnProperty.call(values,'offsetSeconds'))
        calibration.offsetSeconds=clamp(safeNumber(values.offsetSeconds,0),-30,30);
      if(Object.prototype.hasOwnProperty.call(values,'speed'))
        calibration.speed=clamp(safeNumber(values.speed,1),0.6,1.4);
      invalidate();
      return this.get();
    },
    reset:function(){
      calibration={offsetSeconds:0,speed:initialKaraokeBpm/referenceBpm()};
      invalidate();return this.get();
    },
    midiTimeFromSidTime:function(seconds){
      return Math.max(0,(safeNumber(seconds,0)-calibration.offsetSeconds)*calibration.speed);
    }
  };
  // Read public values for every visitor. The URL is no-store; any new
  // publication takes effect on subsequent page loads / explicit refresh.
  fetchPublic().catch(function(err){
    console.warn('Public Karaoke sync not available; default timing retained:',err);
  });

  function isThisCover(item){
    if(!item)return false;
    var ref=item._hvscRef||null;
    if(ref&&ref.file===data.sidFile&&ref.pack===data.sidPack)return true;
    return item.file===data.sidFile&&/uctumi|palladino/i.test(String(item.author||''));
  }
  function songLabel(item){
    if(isThisCover(item))
      return data.title+' — '+data.originalArtist+' / COVER SID BY '+data.sidCoverBy;
    var name=item&&(item.name||item.file)||'SELECTED SID';
    var author=item&&item.author;
    return String(name)+(author?' / SID BY '+String(author):'');
  }
  function makeLines(){
    var all=[],line=[];
    function finish(){
      if(!line.length)return;
      all.push({
        parts:line,
        start:line[0].beat*data.secondsPerBeat,
        end:line[line.length-1].beat*data.secondsPerBeat+data.secondsPerBeat
      });
      line=[];
    }
    for(var i=0;i<data.beats.length;i++){
      var token=String(data.beats[i]||'');
      // A caret is only a paragraph separator. A tilde is a line break,
      // and all other characters, including spaces, are lyric fragments.
      var piece=token.replace(/[~^]/g,'');
      if(piece&&piece.trim())line.push({beat:data.firstBeat+i,text:piece});
      if(token.indexOf('~')!==-1)finish();
    }
    finish();
    return all;
  }
  var lines=makeLines();
  function invalidate(){
    lastLine=-99;lastPart=-99;lastMode='';lastSong=null;
    activeSpans=[];currentLine=null;currentPart=-1;
  }
  function setContents(mode,lineNumber){
    words.replaceChildren();
    activeSpans=[];currentLine=null;currentPart=-1;
    if(mode!=='lyrics'){
      var label=document.createElement('span');
      label.className='rico-karaoke-instrumental';
      label.textContent=mode==='waiting'?'PREPARING SID':mode==='intro'?'INSTRUMENTAL':'LYRICS AREA';
      words.appendChild(label);
      ball.hidden=true;
      return;
    }
    var line=lines[lineNumber];
    if(!line)return;
    var primary=document.createElement('div');
    primary.className='rico-karaoke-line';
    primary.setAttribute('aria-live','off');
    line.parts.forEach(function(part,j){
      var span=document.createElement('span');
      span.className='rico-karaoke-piece';
      span.textContent=part.text;
      primary.appendChild(span);
      activeSpans.push(span);
    });
    words.appendChild(primary);
    if(lines[lineNumber+1]){
      var following=document.createElement('div');
      following.className='rico-karaoke-following';
      following.textContent=lines[lineNumber+1].parts.map(function(p){return p.text;}).join('');
      words.appendChild(following);
    }
    currentLine=line;
    ball.hidden=false;
  }
  function placeBall(){
    if(!currentLine||currentPart<0||!activeSpans[currentPart]){
      ball.hidden=true;return;
    }
    var target=activeSpans[currentPart].getBoundingClientRect();
    var box=area.getBoundingClientRect();
    // An 8x8 original C64 glyph displayed as 32x32 sharp pixels.
    var x=target.left-box.left+target.width/2-16;
    var y=target.top-box.top-36;
    ball.style.left=clamp(x,0,Math.max(0,box.width-32))+'px';
    ball.style.top=clamp(y,0,Math.max(0,box.height-32))+'px';
    ball.hidden=false;
  }
  function setPart(index){
    if(index===lastPart)return;
    var old=activeSpans[lastPart];
    if(old)old.classList.remove('rico-karaoke-piece-current');
    lastPart=index;
    currentPart=index;
    var next=activeSpans[index];
    if(next)next.classList.add('rico-karaoke-piece-current');
    placeBall();
  }
  function timelinePosition(){
    if(!player.sampleRate)return 0;
    return window.SpotySidKaraokeSync.midiTimeFromSidTime(
      (player.autoElapsedSamples||0)/player.sampleRate);
  }
  function displayedSong(){
    var idx=typeof player.sidListIndex==='number'?player.sidListIndex:-1;
    if(requestedIndex!==null&&
      (idx!==requestedIndex||player.autoLoading))
      return {item:requestedItem,waiting:true};
    if(requestedIndex===idx)requestedIndex=null;
    return {item:idx>=0&&player.sidList?player.sidList[idx]:requestedItem,waiting:false};
  }
  function update(){
    if(!karaoke.isActive())return;
    var state=displayedSong(),item=state.item;
    if(item!==lastSong){
      lastSong=item;
      lastLine=-99;lastPart=-99;lastMode='';
    }
    var nextTitle=songLabel(item);
    // TEST380 may rewrite the header as playback switches. The song credit
    // always wins without touching its original playlist metadata.
    if(title.textContent!==nextTitle)title.textContent=nextTitle;
    // TEST382: when AUTO/NEXT starts a SID without Karaoke metadata,
    // leave Karaoke at once and restore the normal oscilloscope. The audio
    // handoff remains wholly owned by the existing playlist player.
    if(!isThisCover(item)){
      if(!state.waiting){
        karaoke.close();
        return;
      }
      if(lastMode!=='waiting'){
        setContents('waiting');
        lastMode='waiting';lastLine=-99;
      }
      return;
    }
    if(state.waiting||!player.isPlaying&& !player.isPaused){
      if(lastMode!=='waiting'){
        setContents('waiting');
        lastMode='waiting';lastLine=-99;
      }
      return;
    }
    var time=timelinePosition();
    var index=-1;
    for(var i=0;i<lines.length;i++){
      if(time>=lines[i].start)index=i;
      else break;
    }
    // During a long instrumental gap remove previous lyrics after 2 seconds.
    var mode=index===-1?'intro':(
      time>lines[index].end+2 &&
      (index===lines.length-1||lines[index+1].start-time>2) ?
      'intro':'lyrics');
    if(mode!==lastMode||index!==lastLine){
      setContents(mode,index);
      lastMode=mode;lastLine=index;lastPart=-99;
    }
    if(mode!=='lyrics'||!currentLine)return;
    var part=-1;
    for(var p=0;p<currentLine.parts.length;p++){
      if(time>=currentLine.parts[p].beat*data.secondsPerBeat)part=p;
      else break;
    }
    setPart(part);
  }
  var previousRender=player.render;
  player.render=function(){
    var result=previousRender.apply(this,arguments);
    update();
    return result;
  };
  var originalOpen=karaoke.open;
  karaoke.open=function(item,index){
    requestedIndex=typeof index==='number'?index:null;
    requestedItem=item||null;
    invalidate();
    // TEST382: explicitly entering a supported Karaoke makes the normal
    // AUTO next-song behavior available, even if AUTO was switched off.
    if(isThisCover(item)&&!player.autoAdvance){
      player.autoAdvance=true;
      if(typeof player.updateAutoButton==='function')player.updateAutoButton();
    }
    var result=originalOpen.apply(karaoke,arguments);
    update();
    return result;
  };
  var originalClose=karaoke.close;
  karaoke.close=function(){
    requestedIndex=null;requestedItem=null;invalidate();
    return originalClose.apply(karaoke,arguments);
  };
  window.addEventListener('resize',function(){
    if(karaoke.isActive())requestAnimationFrame(placeBall);
  });
})();