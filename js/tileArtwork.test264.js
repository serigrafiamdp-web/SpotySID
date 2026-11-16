/* TEST264 — SpotySid CREATE TILE ARTWORK · C64 hi-res 32×8 chars.
   First prototype only: single-bit 256×64 canvas, no uploads or profile writes. */
(function(){
  'use strict';
  if(window.RicoTileArtwork)return;
  var WIDTH=256,HEIGHT=64,LENGTH=WIDTH*HEIGHT;
  var pixels=new Uint8Array(LENGTH),undoStack=[],MAX_UNDO=30;
  var activeTool='pencil',drawing=false,lastPoint=null;
  var overlay=null,panel=null,head=null,surface=null,stage=null,picture=null,grid=null,toolbar=null;
  var pictureCtx=null,gridCtx=null,scale=4;
  var dragState=null,dragX=0,dragY=0;

  function themeColor(){
    var css=getComputedStyle(document.documentElement);
    var color=css.getPropertyValue('--rico-theme-fg').trim();
    if(!color||color==='transparent')color=getComputedStyle(document.body).color;
    return color||'#ffffff';
  }
  function button(label,action){
    var b=document.createElement('button');
    b.type='button';b.textContent=label;
    b.addEventListener('click',action);
    return b;
  }
  function pushUndo(){
    undoStack.push(pixels.slice());
    if(undoStack.length>MAX_UNDO)undoStack.shift();
    syncUndo();
  }
  function syncUndo(){
    if(!toolbar)return;
    var undo=toolbar.querySelector('[data-rico-tile-undo]');
    if(undo)undo.disabled=!undoStack.length;
  }
  function selectTool(tool){
    activeTool=tool;
    if(!toolbar)return;
    toolbar.querySelectorAll('[data-rico-tile-tool]').forEach(function(b){
      b.setAttribute('aria-pressed',String(b.dataset.ricoTileTool===tool));
    });
    if(picture)picture.style.cursor=tool==='fill'?'cell':'crosshair';
  }
  function paint(){
    if(!pictureCtx)return;
    pictureCtx.fillStyle='#000000';
    pictureCtx.fillRect(0,0,WIDTH,HEIGHT);
    pictureCtx.fillStyle=themeColor();
    for(var y=0;y<HEIGHT;y++){
      for(var x=0;x<WIDTH;x++)if(pixels[y*WIDTH+x])
        pictureCtx.fillRect(x,y,1,1);
    }
  }
  function drawGrid(){
    if(!gridCtx)return;
    var w=WIDTH*scale,h=HEIGHT*scale;
    grid.width=w;grid.height=h;
    gridCtx.clearRect(0,0,w,h);
    gridCtx.fillStyle=themeColor();
    // Each one-pixel cell is visible; the 8×8 C64 character grid is stronger.
    for(var x=1;x<WIDTH;x++){
      gridCtx.globalAlpha=x%8===0?0.24:0.07;
      gridCtx.fillRect(x*scale,0,1,h);
    }
    for(var y=1;y<HEIGHT;y++){
      gridCtx.globalAlpha=y%8===0?0.24:0.07;
      gridCtx.fillRect(0,y*scale,w,1);
    }
    gridCtx.globalAlpha=1;
  }
  function resizeCanvas(){
    if(!stage||!surface)return;
    var available=Math.max(256,stage.clientWidth-2);
    scale=Math.max(1,Math.min(4,Math.floor(available/WIDTH)));
    var w=WIDTH*scale,h=HEIGHT*scale;
    surface.style.width=w+'px';surface.style.height=h+'px';
    picture.style.width=w+'px';picture.style.height=h+'px';
    grid.style.width=w+'px';grid.style.height=h+'px';
    drawGrid();paint();
  }
  function point(event){
    var rect=picture.getBoundingClientRect();
    var x=Math.floor((event.clientX-rect.left)*WIDTH/rect.width);
    var y=Math.floor((event.clientY-rect.top)*HEIGHT/rect.height);
    return {x:Math.max(0,Math.min(WIDTH-1,x)),
      y:Math.max(0,Math.min(HEIGHT-1,y))};
  }
  function putPixel(x,y){
    pixels[y*WIDTH+x]=activeTool==='eraser'?0:1;
  }
  function drawLine(from,to){
    var x=from.x,y=from.y,dx=Math.abs(to.x-x),dy=Math.abs(to.y-y);
    var sx=x<to.x?1:-1,sy=y<to.y?1:-1,err=dx-dy;
    while(true){
      putPixel(x,y);
      if(x===to.x&&y===to.y)break;
      var twice=2*err;
      if(twice>-dy){err-=dy;x+=sx;}
      if(twice<dx){err+=dx;y+=sy;}
    }
  }
  function fillAt(x,y){
    var start=y*WIDTH+x,source=pixels[start],target=1;
    if(source===target)return false;
    pushUndo();
    var queue=new Int32Array(LENGTH),head=0,tail=0;
    queue[tail++]=start;pixels[start]=target;
    while(head<tail){
      var i=queue[head++],cx=i%WIDTH,cy=Math.floor(i/WIDTH);
      var left=i-1,right=i+1,up=i-WIDTH,down=i+WIDTH;
      if(cx>0&&pixels[left]===source){pixels[left]=target;queue[tail++]=left;}
      if(cx<WIDTH-1&&pixels[right]===source){pixels[right]=target;queue[tail++]=right;}
      if(cy>0&&pixels[up]===source){pixels[up]=target;queue[tail++]=up;}
      if(cy<HEIGHT-1&&pixels[down]===source){pixels[down]=target;queue[tail++]=down;}
    }
    paint();return true;
  }
  function pointerDown(event){
    if(event.button!==0)return;
    event.preventDefault();
    var p=point(event);
    if(activeTool==='fill'){fillAt(p.x,p.y);return;}
    pushUndo();drawing=true;lastPoint=p;putPixel(p.x,p.y);paint();
    if(picture.setPointerCapture)picture.setPointerCapture(event.pointerId);
  }
  function pointerMove(event){
    if(!drawing)return;
    event.preventDefault();
    var p=point(event);
    if(lastPoint&&lastPoint.x===p.x&&lastPoint.y===p.y)return;
    drawLine(lastPoint||p,p);lastPoint=p;paint();
  }
  function pointerEnd(event){
    drawing=false;lastPoint=null;
    if(picture&&picture.hasPointerCapture&&picture.hasPointerCapture(event.pointerId))
      picture.releasePointerCapture(event.pointerId);
  }
  function undo(){
    if(!undoStack.length)return;
    pixels=undoStack.pop();paint();syncUndo();
  }
  function close(){
    drawing=false;lastPoint=null;dragState=null;
    if(overlay)overlay.hidden=true;
  }
  function movePanel(event){
    if(!dragState||event.pointerId!==dragState.id)return;
    event.preventDefault();
    // Keep the window within the viewport without moving the canvas itself.
    var dx=event.clientX-dragState.x,dy=event.clientY-dragState.y;
    var margin=4;
    dx=Math.max(margin-dragState.left,
      Math.min(window.innerWidth-margin-dragState.right,dx));
    dy=Math.max(margin-dragState.top,
      Math.min(window.innerHeight-margin-dragState.bottom,dy));
    dragX=dragState.offsetX+dx;
    dragY=dragState.offsetY+dy;
    panel.style.transform='translate('+dragX+'px,'+dragY+'px)';
  }
  function endPanelDrag(event){
    if(!dragState||event.pointerId!==dragState.id)return;
    dragState=null;
    if(head.hasPointerCapture&&head.hasPointerCapture(event.pointerId))
      head.releasePointerCapture(event.pointerId);
  }
  function centerPanel(){
    dragX=0;dragY=0;
    if(panel)panel.style.transform='translate(0px,0px)';
  }
  function create(){
    overlay=document.createElement('div');
    overlay.id='ricoTileArtworkOverlay';
    overlay.className='rico-tile-overlay';
    overlay.hidden=true;
    panel=document.createElement('div');panel.className='rico-tile-panel';
    panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');
    panel.setAttribute('aria-label','CREATE TILE ARTWORK');
    head=document.createElement('div');head.className='rico-tile-head';
    var title=document.createElement('strong');title.textContent='CREATE TILE ARTWORK';
    var closeButton=button('×',close);closeButton.setAttribute('aria-label','Close artwork editor');
    head.appendChild(title);head.appendChild(closeButton);
    // TEST266: drag the title bar, excluding the X, without covering the
    // player or modifying the artwork's 256×64 source pixels.
    head.addEventListener('pointerdown',function(event){
      if(event.button!==0||event.target.closest('button'))return;
      var rect=panel.getBoundingClientRect();
      dragState={id:event.pointerId,x:event.clientX,y:event.clientY,
        left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,
        offsetX:dragX,offsetY:dragY};
      if(head.setPointerCapture)head.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    head.addEventListener('pointermove',movePanel);
    head.addEventListener('pointerup',endPanelDrag);
    head.addEventListener('pointercancel',endPanelDrag);
    toolbar=document.createElement('div');toolbar.className='rico-tile-tools';
    ['pencil','eraser','fill'].forEach(function(tool){
      var b=button(tool.toUpperCase(),function(){selectTool(tool);});
      b.dataset.ricoTileTool=tool;
      toolbar.appendChild(b);
    });
    var undoButton=button('UNDO',undo);undoButton.dataset.ricoTileUndo='true';
    toolbar.appendChild(undoButton);
    var info=document.createElement('span');info.textContent='32×8 CHARS · 256×64 PX · HI-RES';
    info.className='rico-tile-info';toolbar.appendChild(info);
    stage=document.createElement('div');stage.className='rico-tile-stage';
    surface=document.createElement('div');surface.className='rico-tile-surface';
    picture=document.createElement('canvas');picture.width=WIDTH;picture.height=HEIGHT;
    picture.setAttribute('aria-label','256 by 64 pixel tile artwork editing surface');
    picture.className='rico-tile-pixels';
    pictureCtx=picture.getContext('2d',{alpha:false});
    grid=document.createElement('canvas');grid.className='rico-tile-grid';
    grid.setAttribute('aria-hidden','true');
    gridCtx=grid.getContext('2d');
    surface.appendChild(picture);surface.appendChild(grid);
    stage.appendChild(surface);
    panel.appendChild(head);panel.appendChild(toolbar);panel.appendChild(stage);
    overlay.appendChild(panel);document.body.appendChild(overlay);
    picture.addEventListener('pointerdown',pointerDown);
    picture.addEventListener('pointermove',pointerMove);
    picture.addEventListener('pointerup',pointerEnd);
    picture.addEventListener('pointercancel',pointerEnd);
    window.addEventListener('resize',function(){
      if(!overlay.hidden){centerPanel();resizeCanvas();}
    });
    // Palette changes update --rico-theme-fg on the root element.
    // Canvas pixels and grid are not CSS-colored, so redraw both when it
    // changes; existing 1-bit artwork data and undo history stay intact.
    var lastThemeColor=themeColor();
    var themeObserver=new MutationObserver(function(){
      if(!overlay||overlay.hidden)return;
      var next=themeColor();
      if(next===lastThemeColor)return;
      lastThemeColor=next;
      drawGrid();paint();
    });
    themeObserver.observe(document.documentElement,{
      attributes:true,attributeFilter:['style']
    });
    document.addEventListener('keydown',function(event){
      if(!overlay||overlay.hidden||!panel.contains(document.activeElement))return;
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){
        event.preventDefault();event.stopPropagation();undo();
      }
    },true);
    selectTool(activeTool);syncUndo();
  }
  window.RicoTileArtwork={
    open:function(){
      if(!overlay)create();
      // TEST265: close the STIL sidebar, but keep the editor independent of
      // playback and fully modeless. It is only closed with its X button.
      if(window.sidPlayer&&typeof window.sidPlayer.showSIDInfo==='function')
        window.sidPlayer.showSIDInfo(false);
      overlay.hidden=false;
      centerPanel();
      resizeCanvas();
    }
  };
})();