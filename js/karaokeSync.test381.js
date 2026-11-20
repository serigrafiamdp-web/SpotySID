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
  var storageKey='spotysid-karaoke-sync-v1:'+songKey;
  var calibration={offsetSeconds:0,speed:1};
  var requestedIndex=null,requestedItem=null;
  var lastLine=-99,lastPart=-99,lastMode='',lastSong=null;
  var activeSpans=[],currentLine=null,currentPart=-1;

  function clamp(n,low,high){return Math.max(low,Math.min(high,n));}
  function safeNumber(value,fallback){var n=Number(value);return Number.isFinite(n)?n:fallback;}
  function readSaved(){
    try{
      var stored=JSON.parse(localStorage.getItem(storageKey)||'null');
      if(stored&&typeof stored==='object'){
        calibration.offsetSeconds=clamp(safeNumber(stored.offsetSeconds,0),-30,30);
        calibration.speed=clamp(safeNumber(stored.speed,1),0.8,1.2);
      }
    }catch(e){/* storage blocked or absent: retain safe defaults */}
  }
  function save(){
    try{localStorage.setItem(storageKey,JSON.stringify(calibration));}
    catch(e){/* optional storage must not affect audio or OSC */}
  }
  readSaved();
  // No visible controls: this is the sole adjustment entry point.
  // Positive offsetSeconds delays the MIDI lyrics vs. the playing SID.
  // speed > 1.0 makes the MIDI timeline run faster than SID playback.
  window.SpotySidKaraokeSync={
    get:function(){return {offsetSeconds:calibration.offsetSeconds,speed:calibration.speed};},
    set:function(values){
      if(!values||typeof values!=='object')return this.get();
      if(Object.prototype.hasOwnProperty.call(values,'offsetSeconds'))
        calibration.offsetSeconds=clamp(safeNumber(values.offsetSeconds,0),-30,30);
      if(Object.prototype.hasOwnProperty.call(values,'speed'))
        calibration.speed=clamp(safeNumber(values.speed,1),0.8,1.2);
      save();invalidate();return this.get();
    },
    reset:function(){
      calibration={offsetSeconds:0,speed:1};
      try{localStorage.removeItem(storageKey);}catch(e){}
      invalidate();return this.get();
    },
    midiTimeFromSidTime:function(seconds){
      return Math.max(0,(safeNumber(seconds,0)-calibration.offsetSeconds)*calibration.speed);
    }
  };

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
    if(!isThisCover(item)){
      if(lastMode!=='missing'){
        setContents('missing');
        lastMode='missing';lastLine=-99;
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