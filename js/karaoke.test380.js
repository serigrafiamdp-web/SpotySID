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
  // TEST382: compact moving SOUND TIMELINE in the Karaoke viewer.
  // Retain only recent audio-derived amplitude samples; scroll left under a
  // fixed playhead. This is recorded live, not a speculative full-file wave.
  var history=[],lastSampleTime=-1,lastTrackObject=null;
  var historyWindow=18,historyStep=.075;
  function clearHistory(){
    history=[];lastSampleTime=-1;lastTrackObject=null;
  }
  function fmt(t){
    t=Math.max(0,Math.floor(t));
    return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');
  }
  function sampleRecentAudio(now){
    var entry=(typeof player.sidListIndex==='number'&&player.sidList)?
      player.sidList[player.sidListIndex]:null;
    if(entry!==lastTrackObject || (lastSampleTime>=0 && now<lastSampleTime-1)){
      clearHistory();lastTrackObject=entry;
    }
    if(!player.isPlaying || player.isPaused || player.autoLoading ||
       (lastSampleTime>=0 && now-lastSampleTime<historyStep))return;
    if(!window.SID || typeof SID.getChannelBuffer!=='function')return;
    var buffers=[SID.getChannelBuffer(1),SID.getChannelBuffer(2),SID.getChannelBuffer(3)];
    // An RMS envelope of the combined SID voices, sampled from the real
    // engine buffers and normalized for display only; audio remains untouched.
    var sum=0,count=0;
    for(var i=0;i<64;i++){
      var sample=0,voices=0,at=200+i*12;
      for(var v=0;v<3;v++){
        var check=document.getElementById('voice'+(v+1));
        if(check&&!check.checked)continue;
        sample+=SID.readFloatSample(buffers[v],at);
        voices++;
      }
      if(voices)sample/=voices;
      if(Number.isFinite(sample)){sum+=sample*sample;count++;}
    }
    var rms=Math.sqrt(sum/Math.max(1,count));
    history.push({t:now,peak:Math.max(0,Math.min(1,rms*34*(player.scopeVisualGain||1)))});
    lastSampleTime=now;
    while(history.length && history[0].t<now-historyWindow-2)history.shift();
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
  // TEST387: Karaoke only RENDERS a waveform. Tempo is never guessed
  // from the live signal or reestimated during ordinary playback.
  function drawMixedScope(){
    var ctx=player.context,canvas=player.canvas,c=palette();
    if(!ctx||!canvas)return;
    var width=canvas.width,height=canvas.height,band=Math.max(100,Math.min(height*.38,340));
    var center=band*.49,amplitude=Math.max(24,band*.39);
    var cursor=width*.63,secondsPx=width/13;
    var now=player.sampleRate?Math.max(0,(player.autoElapsedSamples||0)/player.sampleRate):0;
    var mode=player.scopeDisplayMode||'hires';
    ctx.clearRect(0,0,width,height);
    sampleRecentAudio(now);
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
    if(mode!=='off'&&history.length>0){
      if(mode==='petscii'){
        var step=8;
        for(var px=0;px<width;px+=step){
          var second=now+(px-cursor)/secondsPx;
          if(second<0||second>now)continue;
          var pick=Math.floor((second-(now-historyWindow-2))/historyStep);
          var nearest=null,dist=.16;
          for(var j=history.length-1;j>=0;j--){
            var delta=Math.abs(history[j].t-second);
            if(delta<dist){dist=delta;nearest=history[j];}
            if(history[j].t<second-.16)break;
          }
          if(!nearest)continue;
          var dots=Math.floor(nearest.peak*amplitude/8);
          for(var dy=0;dy<=dots;dy++){
            drawPetsciiBlock(ctx,px,Math.round(center-dy*8),c.line,8);
            if(dy)drawPetsciiBlock(ctx,px,Math.round(center+dy*8),c.line,8);
          }
        }
      }else if(mode==='pixel'){
        for(var h=0;h<history.length;h++){
          var rec=history[h],x=Math.round((cursor+(rec.t-now)*secondsPx)/4)*4;
          if(x<-4||x>width)continue;
          var a=Math.max(2,Math.round(rec.peak*amplitude/4)*4);
          ctx.fillRect(x,Math.round((center-a)/4)*4,4,2*a);
        }
      }else{
        // HI-RES continuous waveform envelope, grounded in captured SID audio.
        ctx.beginPath();
        for(var h=0;h<history.length;h++){
          var rec=history[h],x=cursor+(rec.t-now)*secondsPx,y=center-rec.peak*amplitude;
          if(h===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        for(var h=history.length-1;h>=0;h--){
          var rec=history[h];ctx.lineTo(cursor+(rec.t-now)*secondsPx,center+rec.peak*amplitude);
        }
        ctx.closePath();
        if(player.oscilloscopeMode==='filled'){ctx.fillStyle=c.fill;ctx.fill();}
        ctx.strokeStyle=c.line;ctx.lineWidth=2;ctx.stroke();
      }
    }
    ctx.strokeStyle=c.line;ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(cursor,27);ctx.lineTo(cursor,band-10);ctx.stroke();
    ctx.fillStyle=c.line;ctx.font='13px RicoAmigaTopaz,monospace';
    ctx.fillText('SOUND TIMELINE · '+(mode==='off'?'OFF':mode.toUpperCase()),14,20);
    ctx.fillText(fmt(now),Math.max(12,Math.min(width-65,cursor+6)),20);
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
  window.SpotySidKaraoke={
    open:function(item,index){setActive(true,item,index);},
    close:close,
    isActive:function(){return active;}
  };
})();