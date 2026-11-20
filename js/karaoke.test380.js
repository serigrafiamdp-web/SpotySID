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
  function drawMixedScope(){
    var ctx=player.context,canvas=player.canvas,c=palette();
    if(!ctx||!canvas)return;
    var width=canvas.width,height=canvas.height;
    var workspaceHeight=Math.min(height*0.28,220);
    var centerY=workspaceHeight*.53,amp=Math.max(16,(workspaceHeight-28)*.45);
    ctx.clearRect(0,0,width,height);
    if(!window.SID||typeof SID.getChannelBuffer!=='function')return;
    var buffers=[SID.getChannelBuffer(1),SID.getChannelBuffer(2),SID.getChannelBuffer(3)];
    var count=Math.min(650,Math.max(1,width));
    var maxSamples=1764,offset=200;
    var activeVoices=[];
    for(var v=0;v<3;v++){
      var box=document.getElementById('voice'+(v+1));
      if(!box||box.checked)activeVoices.push(buffers[v]);
    }
    // Combine the same sample positions for each voice; average rather than
    // stacking 3 separate waveform rows. No change to channel mixing or audio.
    var points=[];
    for(var i=0;i<count;i++){
      var samplePos=Math.min(maxSamples-1,offset+i);
      var sum=0;
      for(var b=0;b<activeVoices.length;b++)
        sum+=SID.readFloatSample(activeVoices[b],samplePos);
      var mixed=activeVoices.length?sum/activeVoices.length:0;
      if(!player.isPlaying&&!player.isPaused)mixed=0;
      var normalized=Math.max(-1,Math.min(1,mixed*24*(player.scopeVisualGain||1)));
      points.push([width*i/Math.max(1,count-1),centerY+normalized*amp]);
    }
    if(!points.length)return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0,0,width,Math.max(1,workspaceHeight));
    ctx.clip();
    if(player.oscilloscopeMode==='filled'){
      ctx.beginPath();
      ctx.moveTo(points[0][0],centerY);
      for(var p=0;p<points.length;p++)ctx.lineTo(points[p][0],points[p][1]);
      ctx.lineTo(points[points.length-1][0],centerY);
      ctx.closePath();ctx.fillStyle=c.fill;ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(points[0][0],points[0][1]);
    for(var j=1;j<points.length;j++)ctx.lineTo(points[j][0],points[j][1]);
    ctx.strokeStyle=c.line;
    ctx.lineWidth=player.scopeDisplayMode==='pixel'?3:2;
    ctx.stroke();
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