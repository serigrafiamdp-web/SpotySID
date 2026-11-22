/* TEST380 — Experimental SpotySID Karaoke UI.
 * View-only scaffold: mixed three-voice scope above a reserved lyric stage,
 * authentic C64 charset ball, and complete return to the original OSC renderer.
 * No lyrics, timestamps, audio backend changes or lyric synchronization here.
 */
(function () {
  'use strict';
  var player=window.sidPlayer;
  var stage=document.getElementById('ricoKaraokeStage');
  var titleNode=document.getElementById('ricoKaraokeTitle');
  var ball=document.getElementById('ricoKaraokeBall');
  var exit=document.getElementById('ricoKaraokeClose');
  if(!player||!stage||!titleNode||!ball||!exit||typeof player.render!=='function')return;
  var active=false, currentIndex=-1;
  var previousRender=player.render;

  function palette(){
    return player.getActivePalette ? player.getActivePalette() :
      {line:'#ffffff',fill:'#ffffff',background:'#000000'};
  }
  function paintPetsciiBall(){
    // Genuine C64 ROM glyph 81: 8x8 filled disk, enlarged with nearest-neighbor.
    var glyph=window.C64CharROM;
    if(!glyph||glyph.length<82*8)return;
    var ctx=ball.getContext('2d'),c=palette();
    ctx.clearRect(0,0,8,8);
    ctx.fillStyle=c.line;
    for(var y=0;y<8;y++){
      var bits=glyph[81*8+y];
      for(var x=0;x<8;x++)if(bits&(0x80>>x))ctx.fillRect(x,y,1,1);
    }
  }
  function songLabel(item){
    return item ? String(item.name||item.file||'SID')+
      (item.author ? ' — '+String(item.author) : '') : 'SELECTED SID';
  }
  function syncCurrentTrack(){
    var next=typeof player.sidListIndex==='number'?player.sidListIndex:-1;
    if(next!==currentIndex){
      currentIndex=next;
      if(next>=0 && player.sidList && player.sidList[next])
        titleNode.textContent=songLabel(player.sidList[next]);
    }
  }
  // TEST392: Karaoke waveforms are sampled/rendered OFFLINE per supported
  // SID. No real-time SID sampling or guessed future audio in this view.
  function fmt(t){
    t=Math.max(0,Math.floor(t));
    return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');
  }
  function drawPetsciiBlock(ctx,x,y,ink,size){
    // Genuine C64 ROM glyph #81, a solid round dot; integer nearest-neighbor.
    var rom=window.C64CharROM,start=81*8;
    if(!rom||rom.length<start+8){
      ctx.fillRect(x,y,size,size);return;
    }
    var cell=Math.max(1,Math.round(size/8));
    ctx.fillStyle=ink;
    for(var row=0;row<8;row++){
      var bits=rom[start+row];
      for(var col=0;col<8;col++)if(bits&(128>>col))
        ctx.fillRect(x+col*cell,y+row*cell,cell,cell);
    }
  }
  // TEST387: Karaoke only RENDERS a waveform; BPM is precomputed.
  // TEST391: draw both sides of the timeline from real SID PCM rendered
  // offline before publishing Karaoke. No synthetic future waveform.
  function offlineWaveformForSong(){
    var wave=window.SpotySidKaraokeWaveform;
    var i=player.sidListIndex;
    var song=typeof i==='number'&&player.sidList?player.sidList[i]:null;
    if(!wave||!song||wave.format!=='spotysid-offline-waveform'||
       !Array.isArray(wave.samples)||!wave.samples.length||
       !(wave.stepSeconds>0))return null;
    var ref=song._hvscRef||null;
    if(ref&&ref.pack===wave.sidPack&&ref.file===wave.sidFile)return wave;
    if(song.file===wave.sidFile&&/uctumi|palladino/i.test(String(song.author||'')))
      return wave;
    return null;
  }
  function offlinePeak(wave,t){
    if(t<0)return null;
    var pos=t/wave.stepSeconds;
    if(pos>=wave.samples.length||t>=wave.durationSeconds)return null;
    var a=Math.floor(pos),frac=pos-a;
    var low=wave.samples[a],high=wave.samples[a+1];
    if(!Number.isFinite(low))return null;
    if(!Number.isFinite(high))high=low;
    return Math.max(0,Math.min(1,(low+(high-low)*frac)/255));
  }
  function drawMixedScope(){
    var ctx=player.context,canvas=player.canvas,c=palette();
    if(!ctx||!canvas)return;
    var width=canvas.width,height=canvas.height,band=Math.max(100,Math.min(height*.38,340));
    var center=band*.49,amplitude=Math.max(24,band*.39);
    var cursor=width*.5,secondsPx=width/13;
    var now=player.sampleRate?Math.max(0,(player.autoElapsedSamples||0)/player.sampleRate):0;
    var mode=player.scopeDisplayMode||'hires';
    ctx.clearRect(0,0,width,height);
    var waveformRecords=[];
    var offline=offlineWaveformForSong();
    if(offline){
      // Only real, pre-rendered SID PCM is drawn, at fixed audio timestamps
      // on both sides of the center playhead.
      for(var xx=0;xx<=width;xx+=4){
        var when=now+(xx-cursor)/secondsPx;
        var peak=offlinePeak(offline,when);
        if(peak!==null)waveformRecords.push({t:when,peak:peak});
      }
    }
    ctx.save();
    ctx.beginPath();ctx.rect(0,0,width,band);ctx.clip();
    // Moving time marks (one mark every 5 seconds) and permanent playhead.
    ctx.fillStyle=c.line;
    ctx.strokeStyle=c.line;
    ctx.font='12px RicoAmigaTopaz,monospace';
    // Use theme ink without alpha: no intermediate grey-colored ticks.
    ctx.globalAlpha=1;
    var visibleStart=Math.max(0,now-cursor/secondsPx);
    var visibleEnd=now+(width-cursor)/secondsPx;
    for(var t=Math.ceil(visibleStart/5)*5;t<=visibleEnd;t+=5){
      var x=cursor+(t-now)*secondsPx;
      ctx.beginPath();ctx.moveTo(x,band-23);ctx.lineTo(x,band-12);ctx.stroke();
      ctx.fillText(fmt(t),x+3,band-28);
    }
    ctx.globalAlpha=1;
    if(mode!=='off'&&waveformRecords.length>0){
      if(mode==='petscii'){
        var step=8;
        for(var px=0;px<width;px+=step){
          var second=now+(px-cursor)/secondsPx;
          if(second<0)continue;
          var nearest=null,dist=.16;
          for(var j=waveformRecords.length-1;j>=0;j--){
            var delta=Math.abs(waveformRecords[j].t-second);
            if(delta<dist){dist=delta;nearest=waveformRecords[j];}
            if(waveformRecords[j].t<second-.16)break;
          }
          if(!nearest)continue;
          var dots=Math.floor(nearest.peak*amplitude/8);
          for(var dy=0;dy<=dots;dy++){
            drawPetsciiBlock(ctx,px,Math.round(center-dy*8),c.line,8);
            if(dy)drawPetsciiBlock(ctx,px,Math.round(center+dy*8),c.line,8);
          }
        }
      }else if(mode==='pixel'){
        for(var h=0;h<waveformRecords.length;h++){
          var rec=waveformRecords[h],x=Math.round((cursor+(rec.t-now)*secondsPx)/4)*4;
          if(x<-4||x>width)continue;
          var a=Math.max(2,Math.round(rec.peak*amplitude/4)*4);
          ctx.fillRect(x,Math.round((center-a)/4)*4,4,2*a);
        }
      }else{
        // HI-RES continuous waveform envelope, grounded in captured SID audio.
        ctx.beginPath();
        for(var h=0;h<waveformRecords.length;h++){
          var rec=waveformRecords[h],x=cursor+(rec.t-now)*secondsPx,y=center-rec.peak*amplitude;
          if(h===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        for(var h=waveformRecords.length-1;h>=0;h--){
          var rec=waveformRecords[h];ctx.lineTo(cursor+(rec.t-now)*secondsPx,center+rec.peak*amplitude);
        }
        ctx.closePath();
        if(player.oscilloscopeMode==='filled'){ctx.fillStyle=c.fill;ctx.fill();}
        ctx.strokeStyle=c.line;ctx.lineWidth=2;ctx.stroke();
      }
    }
    ctx.strokeStyle=c.line;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(cursor,44);ctx.lineTo(cursor,band-45);ctx.stroke();
    // No extra top caption: the existing Karaoke title is the only heading.
    ctx.restore();
  }
  player.render=function(){
    if(!active)return previousRender.apply(this,arguments);
    syncCurrentTrack();
    drawMixedScope();
    paintPetsciiBall();
    if(typeof player.updateVoiceInfo==='function')player.updateVoiceInfo();
  };
  function setActive(state,item,index){
    active=!!state;
    document.documentElement.classList.toggle('rico-karaoke-active',active);
    stage.hidden=!active;
    if(active){
      currentIndex=typeof index==='number'?index:-1;
      titleNode.textContent=songLabel(item);
      // Reset any existing mouse-wheel OSC zoom via the existing resize hook.
      window.dispatchEvent(new Event('resize'));
      paintPetsciiBall();
    }else{
      currentIndex=-1;
    }
    player.render();
  }
  function close(){
    if(!active)return;
    setActive(false);
  }
  exit.addEventListener('click',close);
  document.addEventListener('keydown',function(event){
    if(!active||(event.key!=='Escape'&&event.key!=='Esc'))return;
    var settings=document.getElementById('ricoKaraokeConfigOverlay');
    if(settings&&!settings.hidden)return; // Settings owns ESC while open.
    if(document.getElementById('ricoLivePlaylist') &&
      getComputedStyle(document.getElementById('ricoLivePlaylist')).display!=='none')return;
    if(player.dialogManager&&player.dialogManager.dialogShown)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    close();
  },true);
  // TEST428: registration is an extensible list (one song today).
  // Later songs can be appended to SpotySidKaraokeRegisteredSongs when their
  // respective lyric data and synchronization have been implemented.
  function karaokeSources(){
    var sources=[];
    if(window.SpotySidKaraokeMidi)sources.push(window.SpotySidKaraokeMidi);
    var extras=window.SpotySidKaraokeRegisteredSongs;
    if(Array.isArray(extras))extras.forEach(function(e){if(e)sources.push(e);});
    return sources;
  }
  function isRegisteredKaraoke(item,reference){
    if(!item)return false;
    var ref=reference||item._hvscRef||item;
    return karaokeSources().some(function(known){
      if(!known||!known.sidFile)return false;
      if(known.sidId&&ref.sidId===known.sidId)return true;
      if(ref.pack===known.sidPack&&ref.file===known.sidFile)return true;
      // Fallback for imported copies, but only with a credited matching
      // author; a filename alone is not a valid Karaoke identity.
      var matchingAuthor=known.authorPattern?
        new RegExp(known.authorPattern,'i').test(String(item.author||item.artist||'')):
        (known===window.SpotySidKaraokeMidi&&
         /uctumi|palladino/i.test(String(item.author||item.artist||'')));
      return item.file===known.sidFile&&matchingAuthor;
    });
  }
  window.SpotySidKaraoke={
    open:function(item,index){setActive(true,item,index);},
    close:close,
    isActive:function(){return active;},
    availableFor:isRegisteredKaraoke
  };
  // TEST428 — Auto-enter Karaoke when ANY playlist begins a registered SID,
  // and return to the normal OSC on the next non-Karaoke song. Observe the
  // already-completed playSong handoff; never seek, restart, or alter audio.
  // Tracking the actual list/item/index also preserves a manual K/OSC close
  // for the rest of the SAME song (it won't reopen every render frame).
  var lastAutoList=null,lastAutoItem=null,lastAutoIndex=-1;
  var playSongBeforeAutoKaraoke=player.playSong;
  player.playSong=function(){
    var result=playSongBeforeAutoKaraoke.apply(this,arguments);
    if(!this.isPlaying)return result;
    var index=typeof this.sidListIndex==='number'?this.sidListIndex:-1;
    var item=index>=0&&this.sidList?this.sidList[index]:null;
    // Do not switch the interface for subtunes, resumes or rendering of the
    // same song, and never open Karaoke for an unregistered SID.
    if(lastAutoList===this.sidList&&lastAutoItem===item&&lastAutoIndex===index)
      return result;
    lastAutoList=this.sidList;lastAutoItem=item;lastAutoIndex=index;
    var karaoke=window.SpotySidKaraoke;
    if(!karaoke)return result;
    if(isRegisteredKaraoke(item)){
      if(!karaoke.isActive())karaoke.open(item,index);
      // The legacy loader can reopen the floating playlist *after* playSong.
      // Close it on the microtask following the completed playlist handoff,
      // exactly as the manual MIC and K controls already do.
      Promise.resolve().then(function(){
        if(!karaoke.isActive()||player.sidList!==lastAutoList||
           player.sidListIndex!==index||player.sidList[index]!==item)return;
        var pane=document.getElementById('ricoLivePlaylist');
        if(pane&&getComputedStyle(pane).display!=='none'){
          var closePlaylist=document.getElementById('ricoLiveClose');
          if(closePlaylist)closePlaylist.click();
        }
      });
    }else if(karaoke.isActive())karaoke.close();
    return result;
  };
})();