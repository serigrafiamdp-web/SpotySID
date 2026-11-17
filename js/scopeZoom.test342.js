/* TEST342 — Mouse-wheel zoom for the rendered OSCILLOSCOPE canvas ONLY.
 * Presentation transform: SID/audio data, waveform calculations, DOM layout,
 * menus, buttons, controls and TILEWORK rendering are untouched.
 * As in TILEWORK, the rendered pixel under the mouse remains anchored.
 */
(function(){
  'use strict';
  var canvas=document.getElementById('sidDisplay');
  if(!canvas)return;
  var zoom=1,offsetX=0,offsetY=0;
  var MIN=1,MAX=5,STEP=1.25;

  function visible(element){
    return !!(element&&!element.hidden&&element.getClientRects().length&&
      window.getComputedStyle(element).visibility!=='hidden'&&
      window.getComputedStyle(element).display!=='none');
  }
  function oscOnly(){
    var player=window.sidPlayer;
    if(player&&player.dialogManager&&player.dialogManager.dialogShown)return false;
    if(visible(document.getElementById('ricoLivePlaylist'))||
       visible(document.getElementById('ricoTileArtworkOverlay')))return false;
    // The scope wheel is disabled whenever another foreground dialog is open.
    var panels=document.querySelectorAll('.dialog,[role="dialog"]');
    for(var i=0;i<panels.length;i++)if(visible(panels[i]))return false;
    return true;
  }
  function syncImageRendering(){
    // Preserve sharp original PETSCII and PIXEL blocks. Let HI-RES retain
    // smooth interpolation when it is enlarged.
    var mode=window.sidPlayer&&window.sidPlayer.scopeDisplayMode;
    canvas.style.imageRendering=zoom>1&&
      (mode==='pixel'||mode==='petscii')?'pixelated':'';
  }
  function applyZoom(){
    if(zoom===MIN){
      offsetX=0;offsetY=0;
      canvas.style.transform='';
      canvas.style.transformOrigin='';
      canvas.style.imageRendering='';
      return;
    }
    canvas.style.transformOrigin='0 0';
    canvas.style.transform='translate3d('+offsetX.toFixed(2)+'px,'+
      offsetY.toFixed(2)+'px,0) scale('+zoom.toFixed(5)+')';
    syncImageRendering();
  }
  function clamp(n,low,high){return Math.min(high,Math.max(low,n));}
  function onWheel(event){
    if(!oscOnly()||event.ctrlKey||event.metaKey||event.altKey||
       event.shiftKey||!Number.isFinite(event.deltaY)||event.deltaY===0)return;
    var next=clamp(zoom*(event.deltaY<0?STEP:1/STEP),MIN,MAX);
    if(next<MIN+0.02)next=MIN;
    if(next>MAX-0.02)next=MAX;
    var width=canvas.clientWidth||canvas.width;
    var height=canvas.clientHeight||canvas.height;
    if(!(width>0&&height>0))return;
    event.preventDefault();
    if(next===zoom)return;
    var rect=canvas.getBoundingClientRect();
    // Remove the existing translation to locate the original canvas origin.
    var baseX=rect.left-offsetX,baseY=rect.top-offsetY;
    var mouseX=clamp(event.clientX-baseX,0,width);
    var mouseY=clamp(event.clientY-baseY,0,height);
    var sourceX=(mouseX-offsetX)/zoom;
    var sourceY=(mouseY-offsetY)/zoom;
    offsetX=clamp(mouseX-sourceX*next,width-width*next,0);
    offsetY=clamp(mouseY-sourceY*next,height-height*next,0);
    zoom=next;
    applyZoom();
  }
  canvas.addEventListener('wheel',onWheel,{passive:false});
  // Synchronize interpolation after the existing mode button changes.
  var modeButton=document.getElementById('ricoPetsciiButton');
  if(modeButton)modeButton.addEventListener('click',syncImageRendering);
  window.addEventListener('resize',function(){
    // The underlying player resizes the canvas at viewport changes.
    zoom=MIN;applyZoom();
  });
})();