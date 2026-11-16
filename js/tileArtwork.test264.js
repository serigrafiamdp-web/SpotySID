/* TEST264 — SpotySid CREATE TILE ARTWORK · C64 hi-res 32×8 chars.
   First prototype only: single-bit 256×64 canvas, no uploads or profile writes. */
(function(){
  'use strict';
  if(window.RicoTileArtwork)return;
  var WIDTH=256,HEIGHT=64,LENGTH=WIDTH*HEIGHT;
  var pixels=new Uint8Array(LENGTH),undoStack=[],MAX_UNDO=30;
  var activeTool='pencil',drawing=false,lastPoint=null,strokeValue=1;
  var reverseMode=false;
  var selection=null,selectionAnchor=null;
  var artistContext=null,savedWorkId=null,confirmBox=null,saveNote=null;
  var overlay=null,panel=null,surface=null,stage=null,picture=null,grid=null,toolbar=null;
  // The reference view (4x native pixels) is the MINIMUM zoom. 500% = 20x.
  var pictureCtx=null,gridCtx=null,baseScale=4,scale=4,manualScale=null;
  var dragState=null,dragX=0,dragY=0;

  function themeColor(){
    var css=getComputedStyle(document.documentElement);
    var color=css.getPropertyValue('--rico-theme-fg').trim();
    if(!color||color==='transparent')color=getComputedStyle(document.body).color;
    return color||'#ffffff';
  }
  function themeBackground(){
    // The C64 BASIC and C64 Cyan palettes use colored canvas backgrounds.
    // Do not replace them with black: match the actual oscilloscope backdrop.
    var color=getComputedStyle(document.documentElement)
      .getPropertyValue('--rico-theme-bg').trim();
    return color&&color!=='transparent'?color:'#000000';
  }
  function button(label,action){
    var b=document.createElement('button');
    b.type='button';b.textContent=label;
    b.addEventListener('click',action);
    return b;
  }
  // Small, original 12×12 single-bit tool glyphs — classic paint-tool look.
  // They inherit the selected SpotySid palette through CSS currentColor.
  var toolGlyphs={
    pencil:[
      '..........##','.........###','........##.#','.......##.#.',
      '......##.#..','.....##.#...','....##.#....','...##.#.....',
      '..##.#......','.##.#.......','###.........','##..........'
    ],
    eraser:[
      '............','......####..','.....######.','....##...###',
      '...##...###.','..##...###..','.##...###...','##...###....',
      '########....','.######.....','............','............'
    ],
    fill:[
      '.....##.....','.....##.....','..#..##.....','..#.#..#....',
      '...#....#...','..#......#..','..#......#..','...#....#...',
      '....####....','.....##..#..','.........###','..........#.'
    ],
    select:[
      '##..##..##..','#..........#','............','............',
      '#..........#','............','............','............',
      '#..........#','............','............','##..##..##..'
    ],
    invert:[
      '############','#.....#####.','#.....#####.','#.....#####.',
      '#.....#####.','#.....#####.','#.....#####.','#.....#####.',
      '#.....#####.','#.....#####.','#.....#####.','############'
    ],
    undo:[
      '...##.......','..##........','.####.......','######......',
      '.####..#####','..##..#....#','...##......#','.........##.',
      '.........#..','..........#.','....######..','............'
    ],
    close:[
      '##........##','.##......##.','..##....##..','...##..##...',
      '....####....','.....##.....','.....##.....','....####....',
      '...##..##...','..##....##..','.##......##.','##........##'
    ],
    star:[
      '.....##.....','.....##.....','....####....','....####....',
      '############','.##########.','..########..','...######...',
      '...######...','..###..###..','.##......##.','............'
    ],
    save:[
      '.##########.','.#........#.','.#.######.#.','.#.######.#.',
      '.#.######.#.','.#........#.','.#.######.#.','.#.######.#.',
      '.#.#....#.#.','.#.#....#.#.','.#.######.#.','.##########.'
    ]
  };
  function iconFor(tool){
    var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 12 12');svg.setAttribute('width','20');
    svg.setAttribute('height','20');svg.setAttribute('aria-hidden','true');
    svg.style.imageRendering='pixelated';
    var rows=toolGlyphs[tool],path='';
    rows.forEach(function(row,y){
      for(var x=0;x<12;x++)if(row.charAt(x)==='#')
        path+='M'+x+' '+y+'h1v1h-1z';
    });
    var shape=document.createElementNS('http://www.w3.org/2000/svg','path');
    shape.setAttribute('d',path);shape.setAttribute('fill','currentColor');
    svg.appendChild(shape);return svg;
  }
  function toolButton(tool,label,action){
    var b=button('',action);
    b.className='rico-tile-icon-button';
    // Names stay accessible without the browser's native white hover tooltip.
    b.setAttribute('aria-label',label);
    b.appendChild(iconFor(tool));
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
    if(picture)picture.style.cursor=tool==='fill'?'cell':
      tool==='select'?'crosshair':'crosshair';
  }
  // TEST280: the LCD palette must use only glass/ink, including STAR inverse.
  function lcdTwoTone(){return document.documentElement.getAttribute('data-rico-lcd')==='2tone';}
  function reverseInkColor(){return lcdTwoTone()?themeBackground():'#000000';}
  function paint(){
    if(!pictureCtx)return;
    // Logical bit 0 = background, bit 1 = ink. Star reverses their colors,
    // not the source bitmap, so mouse-left still paints and right still erases.
    pictureCtx.fillStyle=reverseMode?themeColor():themeBackground();
    pictureCtx.fillRect(0,0,WIDTH,HEIGHT);
    pictureCtx.fillStyle=reverseMode?reverseInkColor():themeColor();
    for(var y=0;y<HEIGHT;y++){
      for(var x=0;x<WIDTH;x++)if(pixels[y*WIDTH+x])
        pictureCtx.fillRect(x,y,1,1);
    }
  }
  function toggleReverseMode(){
    reverseMode=!reverseMode;
    var control=toolbar&&toolbar.querySelector('[data-rico-tile-reverse]');
    if(control)control.setAttribute('aria-pressed',String(reverseMode));
    drawGrid();paint();
  }
  function drawGrid(){
    if(!gridCtx)return;
    var w=WIDTH*scale,h=HEIGHT*scale;
    grid.width=w;grid.height=h;
    gridCtx.clearRect(0,0,w,h);
    gridCtx.fillStyle=reverseMode?reverseInkColor():themeColor();
    // With LCD two-tone no semi-transparent grey grid: only 8×8 pixel borders.
    var lcdGrid=lcdTwoTone();
    // Each one-pixel cell is visible in the other palettes; 8×8 grid is stronger.
    for(var x=1;x<WIDTH;x++){
      gridCtx.globalAlpha=lcdGrid?(x%8===0?1:0):(x%8===0?0.24:0.07);
      gridCtx.fillRect(x*scale,0,1,h);
    }
    for(var y=1;y<HEIGHT;y++){
      gridCtx.globalAlpha=lcdGrid?(y%8===0?1:0):(y%8===0?0.24:0.07);
      gridCtx.fillRect(0,y*scale,w,1);
    }
    gridCtx.globalAlpha=1;
    drawSelection();
  }
  function normalizedSelection(){
    if(!selection)return null;
    return {x1:Math.min(selection.x1,selection.x2),y1:Math.min(selection.y1,selection.y2),
      x2:Math.max(selection.x1,selection.x2),y2:Math.max(selection.y1,selection.y2)};
  }
  function drawSelection(){
    var box=normalizedSelection();
    if(!gridCtx||!box)return;
    gridCtx.save();
    gridCtx.strokeStyle=reverseMode?reverseInkColor():themeColor();
    gridCtx.lineWidth=1;gridCtx.globalAlpha=lcdTwoTone()?1:0.95;
    gridCtx.setLineDash([4,3]);
    gridCtx.strokeRect(box.x1*scale+0.5,box.y1*scale+0.5,
      (box.x2-box.x1+1)*scale-1,(box.y2-box.y1+1)*scale-1);
    gridCtx.restore();
  }
  function invertPixels(){
    var box=normalizedSelection()||{x1:0,y1:0,x2:WIDTH-1,y2:HEIGHT-1};
    pushUndo();
    for(var y=box.y1;y<=box.y2;y++)
      for(var x=box.x1;x<=box.x2;x++)
        pixels[y*WIDTH+x]^=1;
    paint();
  }
  function resizeCanvas(){
    if(!stage||!surface)return;
    // TEST270: fixed-size editor viewport; only its CONTENT zooms.
    // 4× = user's minimum reference; 20× = 500% of that reference.
    scale=manualScale===null?baseScale:manualScale;
    var w=WIDTH*scale,h=HEIGHT*scale;
    surface.style.width=w+'px';surface.style.height=h+'px';
    picture.style.width=w+'px';picture.style.height=h+'px';
    grid.style.width=w+'px';grid.style.height=h+'px';
    drawGrid();paint();
  }
  function zoomWithWheel(event){
    if(!overlay||overlay.hidden)return;
    event.preventDefault();
    event.stopPropagation();
    if(event.deltaY===0)return;
    var next=Math.max(baseScale,Math.min(baseScale*5,scale+(event.deltaY<0?1:-1)));
    if(next===scale)return;
    // Keep the artwork pixel under the pointer in roughly the same place.
    var before=picture.getBoundingClientRect();
    var sourceX=(event.clientX-before.left)/scale;
    var sourceY=(event.clientY-before.top)/scale;
    manualScale=next;
    resizeCanvas();
    var after=picture.getBoundingClientRect();
    stage.scrollLeft+=after.left+sourceX*next-event.clientX;
    stage.scrollTop+=after.top+sourceY*next-event.clientY;
  }
  function point(event){
    var rect=picture.getBoundingClientRect();
    var x=Math.floor((event.clientX-rect.left)*WIDTH/rect.width);
    var y=Math.floor((event.clientY-rect.top)*HEIGHT/rect.height);
    return {x:Math.max(0,Math.min(WIDTH-1,x)),
      y:Math.max(0,Math.min(HEIGHT-1,y))};
  }
  function putPixel(x,y){
    pixels[y*WIDTH+x]=strokeValue;
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
  function fillAt(x,y,target){
    var start=y*WIDTH+x,source=pixels[start];
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
    if(event.button!==0&&event.button!==2)return;
    event.preventDefault();
    // Both palette modes: left paints ink, right restores background.
    // The ERASER icon also erases with the left button.
    strokeValue=event.button===2||activeTool==='eraser'?0:1;
    var p=point(event);
    if(activeTool==='select'){
      selectionAnchor=p;
      selection={x1:p.x,y1:p.y,x2:p.x,y2:p.y};
      drawing=true;drawGrid();
      if(picture.setPointerCapture)picture.setPointerCapture(event.pointerId);
      return;
    }
    if(selection){selection=null;drawGrid();}
    if(activeTool==='fill'){fillAt(p.x,p.y,strokeValue);return;}
    pushUndo();drawing=true;lastPoint=p;putPixel(p.x,p.y);paint();
    if(picture.setPointerCapture)picture.setPointerCapture(event.pointerId);
  }
  function pointerMove(event){
    if(!drawing)return;
    event.preventDefault();
    var p=point(event);
    if(activeTool==='select'&&selectionAnchor){
      selection.x2=p.x;selection.y2=p.y;drawGrid();return;
    }
    if(lastPoint&&lastPoint.x===p.x&&lastPoint.y===p.y)return;
    drawLine(lastPoint||p,p);lastPoint=p;paint();
  }
  function pointerEnd(event){
    drawing=false;lastPoint=null;selectionAnchor=null;
    if(picture&&picture.hasPointerCapture&&picture.hasPointerCapture(event.pointerId))
      picture.releasePointerCapture(event.pointerId);
  }
  function undo(){
    if(!undoStack.length)return;
    pixels=undoStack.pop();paint();syncUndo();
  }
  function note(message){
    if(!saveNote)return;
    saveNote.textContent=message;saveNote.hidden=!message;
  }
  function packArtwork(){
    var packed=new Uint8Array(LENGTH/8);
    for(var i=0;i<LENGTH;i++)if(pixels[i])
      packed[i>>3]|=(128>>(i&7));
    var binary='';
    for(var j=0;j<packed.length;j++)binary+=String.fromCharCode(packed[j]);
    return btoa(binary);
  }
  function saveArtwork(){
    if(!artistContext||!window.RicoStilPlusTileworks){
      note('ARTIST UNAVAILABLE');return false;
    }
    try{
      var result=window.RicoStilPlusTileworks.save(artistContext,{
        id:savedWorkId,bits:packArtwork(),reverse:reverseMode
      });
      if(!result||!result.ok){
        note(result&&result.message||'SAVE FAILED');return false;
      }
      savedWorkId=result.id;
      note(result.label+' · SAVED LOCAL');
      return true;
    }catch(error){
      console.warn('STIL+ TILEWORK save failed:',error);
      note('SAVE FAILED');return false;
    }
  }
  function close(){
    drawing=false;lastPoint=null;dragState=null;
    if(confirmBox)confirmBox.hidden=true;
    if(overlay)overlay.hidden=true;
  }
  function confirmClose(){
    if(!confirmBox)return;
    confirmBox.hidden=false;
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
    if(panel.hasPointerCapture&&panel.hasPointerCapture(event.pointerId))
      panel.releasePointerCapture(event.pointerId);
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
    // TEST269: no header or title. Drag from the black, unused tool-strip
    // area or the frame, never from the canvas or from a tool button.
    panel.addEventListener('pointerdown',function(event){
      if(event.button!==0||
         (event.target!==panel&&event.target!==toolbar&&event.target!==stage))
        return;
      var rect=panel.getBoundingClientRect();
      dragState={id:event.pointerId,x:event.clientX,y:event.clientY,
        left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,
        offsetX:dragX,offsetY:dragY};
      if(panel.setPointerCapture)panel.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    panel.addEventListener('pointermove',movePanel);
    panel.addEventListener('pointerup',endPanelDrag);
    panel.addEventListener('pointercancel',endPanelDrag);
    // TEST267: Deluxe Paint-style compact icon tray LEFT of the C64 grid.
    toolbar=document.createElement('div');toolbar.className='rico-tile-tools';
    ['pencil','eraser','fill','select'].forEach(function(tool){
      var b=toolButton(tool,tool.toUpperCase(),function(){selectTool(tool);});
      b.dataset.ricoTileTool=tool;
      toolbar.appendChild(b);
    });
    var invertButton=toolButton('invert','INVERT',invertPixels);
    toolbar.appendChild(invertButton);
    var starButton=toolButton('star','REVERSE COLORS',toggleReverseMode);
    starButton.dataset.ricoTileReverse='true';
    starButton.setAttribute('aria-pressed',String(reverseMode));
    toolbar.appendChild(starButton);
    var undoButton=toolButton('undo','UNDO',undo);
    undoButton.dataset.ricoTileUndo='true';
    toolbar.appendChild(undoButton);
    // TEST272: floppy saves to the captured STIL+ ARTIST, not the
    // currently playing SID. Repeated saves update the same TILEWORK.
    var saveButton=toolButton('save','SAVE TILEWORK',saveArtwork);
    saveButton.dataset.ricoTileSave='true';
    toolbar.appendChild(saveButton);
    var closeButton=toolButton('close','CLOSE',confirmClose);
    closeButton.dataset.ricoTileClose='true';
    toolbar.appendChild(closeButton);
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
    var workspace=document.createElement('div');workspace.className='rico-tile-workspace';
    workspace.appendChild(toolbar);workspace.appendChild(stage);
    panel.appendChild(workspace);
    saveNote=document.createElement('div');
    saveNote.className='rico-tile-save-note';
    saveNote.setAttribute('aria-live','polite');saveNote.hidden=true;
    panel.appendChild(saveNote);
    // Only two actions, matching the user's minimal exit dialog.
    confirmBox=document.createElement('div');
    confirmBox.className='rico-tile-exit-confirm';confirmBox.hidden=true;
    confirmBox.setAttribute('role','alertdialog');
    confirmBox.setAttribute('aria-label','SAVE BEFORE EXIT?');
    var confirmTitle=document.createElement('div');
    confirmTitle.className='rico-tile-exit-title';
    confirmTitle.textContent='SAVE BEFORE EXIT?';
    var confirmButtons=document.createElement('div');
    confirmButtons.className='rico-tile-exit-actions';
    var exitSave=button('EXIT & SAVE',function(){
      if(saveArtwork())close();
    });
    var exitOnly=button('EXIT ONLY',close);
    confirmButtons.appendChild(exitSave);confirmButtons.appendChild(exitOnly);
    confirmBox.appendChild(confirmTitle);confirmBox.appendChild(confirmButtons);
    panel.appendChild(confirmBox);
    overlay.appendChild(panel);document.body.appendChild(overlay);
    picture.addEventListener('pointerdown',pointerDown);
    picture.addEventListener('pointermove',pointerMove);
    picture.addEventListener('pointerup',pointerEnd);
    picture.addEventListener('pointercancel',pointerEnd);
    // Prevent the browser's context menu while drawing with the right button.
    picture.addEventListener('contextmenu',function(event){event.preventDefault();});
    stage.addEventListener('wheel',zoomWithWheel,{passive:false});
    window.addEventListener('resize',function(){
      if(!overlay.hidden){centerPanel();resizeCanvas();}
    });
    // Palette changes update --rico-theme-fg on the root element.
    // Canvas pixels and grid are not CSS-colored, so redraw both when it
    // changes; existing 1-bit artwork data and undo history stay intact.
    var lastThemeColor=themeColor(),lastThemeBackground=themeBackground();
    var themeObserver=new MutationObserver(function(){
      if(!overlay||overlay.hidden)return;
      var next=themeColor(),nextBg=themeBackground();
      if(next===lastThemeColor&&nextBg===lastThemeBackground)return;
      lastThemeColor=next;lastThemeBackground=nextBg;
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
  // TEST270: disable the native context menu within the SpotySid page.
  // Outside the web page / browser chrome, the OS still controls its menus.
  document.addEventListener('contextmenu',function(event){event.preventDefault();},true);
  window.RicoTileArtwork={
    open:function(context,work){
      if(!overlay)create();
      // TEST273: reopening a saved TILEWORK restores the same one-bit
      // pixels, reverse mode and persistent ID. Future SAVE overwrites
      // that work rather than making TILEWORK N+1.
      // The artist is frozen at opening, even if playback later changes.
      if(!overlay.hidden)return false;
      if(!context||typeof context.key!=='string')return false;
      var restored=null;
      if(work){
        if(typeof work.id!=='string'||typeof work.bits!=='string'||
           work.bits.length!==2732||
           !/^[A-Za-z0-9+/]{2731}=$/.test(work.bits)||
           typeof work.reverse!=='boolean')return false;
        try{
          var bytes=atob(work.bits);
          if(bytes.length!==LENGTH/8)return false;
          restored=new Uint8Array(LENGTH);
          for(var i=0;i<LENGTH;i++)
            restored[i]=(bytes.charCodeAt(i>>3)&(128>>(i&7)))?1:0;
        }catch(error){
          console.warn('STIL+ TILEWORK could not be opened:',error);
          return false;
        }
      }
      artistContext={key:context.key,artist:context.artist||''};
      savedWorkId=work?work.id:null;
      pixels.fill(0);
      if(restored)pixels.set(restored);
      undoStack.length=0;
      selection=null;selectionAnchor=null;drawing=false;lastPoint=null;
      reverseMode=work?work.reverse:false;
      if(toolbar){
        var star=toolbar.querySelector('[data-rico-tile-reverse]');
        if(star)star.setAttribute('aria-pressed',String(reverseMode));
      }
      if(confirmBox)confirmBox.hidden=true;
      note('');syncUndo();
      if(window.sidPlayer&&typeof window.sidPlayer.showSIDInfo==='function')
        window.sidPlayer.showSIDInfo(false);
      overlay.hidden=false;manualScale=null;
      centerPanel();resizeCanvas();
      stage.scrollLeft=0;stage.scrollTop=0;
      return true;
    }
  };
})();