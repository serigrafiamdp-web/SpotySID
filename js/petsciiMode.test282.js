/* TEST282 — Authentic PETSCII character-mode oscilloscope and UI headings.
 * Uses C64CharROM (all 512 original 8x8 character bitmaps) loaded from the
 * user's LVLLVL project. The waveform is assembled ONLY from whole characters:
 * there are no interpolated strokes or individual screen-pixel plotting.
 * Other color themes retain their original scope and interfaces unchanged.
 */
(function(){
  'use strict';
  var player=window.sidPlayer;
  if(!player||typeof player.render!=='function'||!window.C64CharROM||
     window.C64CharROM.length!==4096)return;
  var ROM=window.C64CharROM;
  var atlas=null,atlasColor='',lastPaint=0;
  var lastIsPetscii=null,observer=null,domQueued=false;

  function enabled(){
    return player.colorModes[player.colorModeIndex] &&
      player.colorModes[player.colorModeIndex].name==='PETSCII C64';
  }
  function drawAtlas(color){
    if(atlas&&atlasColor===color)return;
    atlasColor=color;
    atlas=document.createElement('canvas');
    atlas.width=32*8;atlas.height=16*8;
    var g=atlas.getContext('2d',{alpha:true});
    g.clearRect(0,0,atlas.width,atlas.height);
    g.fillStyle=color;
    for(var id=0;id<512;id++){
      var x0=(id%32)*8,y0=Math.floor(id/32)*8;
      for(var y=0;y<8;y++){
        var bits=ROM[id*8+y];
        for(var x=0;x<8;x++)if(bits&(128>>x))
          g.fillRect(x0+x,y0+y,1,1);
      }
    }
  }
  function blit(ctx,id,x,y,w,h){
    var gx=(id%32)*8,gy=Math.floor(id/32)*8;
    ctx.drawImage(atlas,gx,gy,8,8,x,y,w,h);
  }
  function codeOf(letter){
    var c=(letter||' ').toUpperCase().charCodeAt(0)||32;
    // Screen codes used by the C64 upper-case / graphic charset.
    if(c>=65&&c<=90)return c-64;
    if(c===64)return 0;          // @
    if(c>=32&&c<=63)return c;   // digits + punctuation + space
    if(c===91)return 27;        // [
    if(c===93)return 29;        // ]
    if(c===95)return 100;       // graphical underscore line
    if(c===124)return 66;      // vertical border glyph
    return 35;                 // unmatched character -> graphics #
  }
  function petText(ctx,txt,x,y,w,h){
    var value=String(txt||'').normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'').toUpperCase();
    for(var i=0;i<value.length;i++)
      blit(ctx,codeOf(value[i]),x+i*w,y,w,h);
  }
  // TEST285 — True PETSCII path construction, NEVER bitmap similarity.
  // Every visible tile is a genuine unmodified C64 ROM glyph selected only
  // by the DIRECTION and CONTINUITY of the SID's audio signal.
  // C64 uppercase/graphics charset character codes (8x8 ROM):
  var SCOPE_GLYPH=Object.freeze({
    horizontal:64,      // two-row horizontal bar
    vertical:93,        // centered two-column vertical bar
    rising:78,          // / rising on screen (toward the upper rows)
    falling:77,         // \ falling on screen (toward the lower rows)
    // TEST286: no cross/corner tiles; their extra arms created ghost lines
  });
  function paintPetscii(){
    var cv=player.canvas,ctx=player.context;
    if(!cv||!ctx||typeof SID==='undefined'||
       typeof SID.getChannelBuffer!=='function')return;
    var palette=player.colorModes[player.colorModeIndex];
    drawAtlas(palette.line);
    var width=cv.width,height=cv.height;
    if(width<=0||height<=0)return;

    // TEST287: use middle-sized, square PETSCII cells on PC displays.
    // At 1920px, ~107 original ROM glyphs fit horizontally at 18px.
    // The clean, deterministic TEST286 waveform renderer is unchanged.
    var cellSize=18;
    var cols=Math.max(1,Math.ceil(width/cellSize));
    var rows=Math.max(1,Math.ceil(height/cellSize));
    var cellW=width/cols,cellH=height/rows;
    ctx.imageSmoothingEnabled=false;
    ctx.fillStyle=palette.background;
    ctx.fillRect(0,0,width,height);

    var channels=player.sidHasSamples?4:3;
    var bufferSize=882*2;
    // TEST286: fewer audio samples per screen lets whole PETSCII glyphs
    // describe clean ramps and plateaus rather than tiny aliasing artifacts.
    var count=Math.min(Math.floor(bufferSize/2.8),Math.max(180,cols*4));
    for(var channel=0;channel<channels;channel++){
      var buffer=SID.getChannelBuffer(channel+1);
      if(!buffer)continue;
      var top=Math.floor(channel*rows/channels);
      var bottom=Math.floor((channel+1)*rows/channels)-1;
      if(bottom<top)continue;

      // Keep a stable real SID waveform window; use zero crossing to
      // reduce horizontal jumping, not replace the source with a fake wave.
      var offset=0,searchStart=Math.floor(count/2);
      var searchEnd=Math.min(bufferSize-count,searchStart+count);
      var previous=SID.readFloatSample(buffer,searchStart);
      for(var k=searchStart+1;k<=searchEnd;k++){
        var next=SID.readFloatSample(buffer,k);
        if(previous<=0&&next>0){
          offset=Math.max(0,Math.min(bufferSize-count,
            k-Math.floor(count/8)));
          break;
        }
        previous=next;
      }
      var samples=new Float32Array(count),min=Infinity,max=-Infinity;
      for(var i=0;i<count;i++){
        var sample=SID.readFloatSample(buffer,offset+i);
        if(!player.isPlaying&&!player.isPaused)sample=0;
        if(!Number.isFinite(sample))sample=0;
        samples[i]=sample;
        if(sample<min)min=sample;
        if(sample>max)max=sample;
      }
      var range=max-min,mid=(min+max)/2;
      // Do not amplify tiny residual samples into a large visual mess.
      if(range<0.00015)continue;
      var center=(top+bottom)/2;
      var heightInRows=Math.max(0,bottom-top-1);
      var gain=range>0.000001?heightInRows*0.88/range:0;
      function valueAt(position){
        var p=Math.max(0,Math.min(count-1,position));
        var aIndex=Math.floor(p),fraction=p-aIndex;
        var a=samples[aIndex],b=samples[Math.min(count-1,aIndex+1)];
        // Preserve abrupt chip transitions: never interpolate a square
        // pulse or sawtooth reset into an invented diagonal segment.
        var abrupt=range>0.000001&&Math.abs(b-a)>range*0.35;
        return abrupt?(fraction<0.5?a:b):a+(b-a)*fraction;
      }
      function yAt(position){
        return Math.max(top,Math.min(bottom,
          center+(valueAt(position)-mid)*gain));
      }
      function tile(id,col,row){
        if(row<top||row>bottom)return;
        blit(ctx,id,col*cellW,row*cellH,cellW,cellH);
      }

      for(var col=0;col<cols;col++){
        var from=col*(count-1)/cols;
        var to=(col+1)*(count-1)/cols;
        var y0=yAt(from),y1=yAt(to),delta=y1-y0;
        // A true abrupt discontinuity is a large SINGLE sample jump.
        // A steep continuous triangle is not classified as a pulse step.
        var aIndex=Math.max(0,Math.floor(from));
        var bIndex=Math.min(count-1,Math.ceil(to));
        var largestJump=0;
        for(var j=aIndex+1;j<=bIndex;j++){
          var jump=Math.abs(samples[j]-samples[j-1]);
          if(jump>largestJump)largestJump=jump;
        }
        var hardEdge=range>0.000001&&largestJump>range*0.35;
        if(hardEdge){
          // A pulse step / sawtooth reset is a CLEAN vertical column.
          // Avoid PETSCII cross tiles at its ends: their side branches
          // were visible as unwanted background noise in TEST285.
          var first=Math.round(Math.min(y0,y1));
          var last=Math.round(Math.max(y0,y1));
          if(first===last){
            tile(SCOPE_GLYPH.horizontal,col,first);
          }else{
            for(var r=first;r<=last;r++)
              tile(SCOPE_GLYPH.vertical,col,r);
          }
        }else if(Math.abs(delta)<0.14){
          // Stable plateau: one horizontal ROM tile, no decoration.
          tile(SCOPE_GLYPH.horizontal,col,Math.round((y0+y1)/2));
        }else{
          // Rising/falling ramps use a SINGLE authentic PETSCII diagonal
          // per column. Repeating it on every crossed row generated the
          // garbled trails and spurious marks in TEST285.
          var diagonal=delta<0?SCOPE_GLYPH.rising:SCOPE_GLYPH.falling;
          tile(diagonal,col,Math.round((y0+y1)/2));
        }
      }
    }
  }

  // Add a real ROM-character facade to short textual interface controls.
  // Original DOM labels and their click/keyboard/focus semantics are retained.
  // When COLOR 11 is deselected, facades disappear with no DOM mutation to
  // playback or playlists.
  function candidateNodes(){
    return document.querySelectorAll(
      '#sidControls button,.dialog .title > div:first-child,.dialog .buttons button,'+
      '#chooseSidDialog button,#ricoLivePlaylistHeader button,'+
      '#ricoRemixBar button,#ricoHelpDialog button,'+
      '#sidInfoContent .rico-show-heading,'+
      '#ricoCommunityTabs button,#ricoCommunityItems button,'+
      '.rico-beta-dialog strong,#ricoLivePlaylistHeader strong'
    );
  }
  function renderLabel(node){
    // Avoid buttons with nested icons / rich HTML; keep those accessible.
    if(node.querySelector('svg,img,input,select,textarea'))return;
    var raw=String(node.textContent||'').replace(/\s+/g,' ').trim();
    if(!raw||raw.length>44)return;
    if(node.dataset.petsciiRendered===raw&&node.querySelector('.rico-petscii-label'))return;
    var old=node.querySelector('.rico-petscii-label');
    if(old)old.remove();
    var width=raw.length*8;
    var cv=document.createElement('canvas'),g=cv.getContext('2d');
    cv.className='rico-petscii-label';
    cv.width=width;cv.height=8;
    g.imageSmoothingEnabled=false;
    petText(g,raw,0,0,8,8);
    cv.setAttribute('aria-hidden','true');
    node.classList.add('rico-petscii-labeled');
    node.dataset.petsciiRendered=raw;
    node.appendChild(cv);
  }
  function refreshLabels(){
    domQueued=false;
    if(!enabled())return;
    var nodes=candidateNodes(),max=Math.min(nodes.length,220);
    for(var i=0;i<max;i++)renderLabel(nodes[i]);
  }
  function queueLabels(){
    if(domQueued||!enabled())return;
    domQueued=true;
    requestAnimationFrame(refreshLabels);
  }
  function syncMode(){
    var active=enabled();
    if(lastIsPetscii===active)return;
    lastIsPetscii=active;lastPaint=0;
    if(active){
      drawAtlas(player.colorModes[player.colorModeIndex].line);
      queueLabels();
    }else{
      // Keep document labels intact and restore CSS normal theme.
      document.querySelectorAll('.rico-petscii-label').forEach(function(cv){cv.remove()});
      document.querySelectorAll('.rico-petscii-labeled').forEach(function(node){
        node.classList.remove('rico-petscii-labeled');
        delete node.dataset.petsciiRendered;
      });
    }
  }
  var originalRender=player.render;
  player.render=function(){
    syncMode();
    if(enabled()){
      var now=performance.now();
      if(now-lastPaint>=40){
        lastPaint=now;
        paintPetscii();
      }
      if(typeof this.updateVoiceInfo==='function')this.updateVoiceInfo();
      return;
    }
    return originalRender.apply(this,arguments);
  };
  observer=new MutationObserver(function(items){
    if(!enabled())return;
    // Ignore modifications created inside character facades themselves.
    if(items.every(function(item){
      return item.target&&item.target.closest&&item.target.closest('.rico-petscii-label');
    }))return;
    queueLabels();
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  window.RicoPetsciiMode={
    enabled:enabled,
    glyphCount:ROM.length/8,
    refresh:queueLabels,
    scopeGlyphs:SCOPE_GLYPH
  };
})();