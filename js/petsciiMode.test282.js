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
  var atlas=null,atlasColor='',glyphCache=new Map(),lastPaint=0;
  var lastIsPetscii=null,observer=null,domQueued=false;
  var BITS=new Uint8Array(256);
  for(var v=1;v<256;v++)BITS[v]=BITS[v>>1]+(v&1);

  function enabled(){
    return player.colorModes[player.colorModeIndex] &&
      player.colorModes[player.colorModeIndex].name==='PETSCII C64';
  }
  function drawAtlas(color){
    if(atlas&&atlasColor===color)return;
    atlasColor=color;glyphCache.clear();
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
  function bestGlyph(rows){
    // Find a *real ROM glyph* whose pixels approximate this segment. Use
    // every one of the 512 C64 codes as candidate, including the alternate
    // charset and inverse/graphic codes. Pixel templates are MATCH INPUT,
    // never drawn as pixels: only the chosen ROM character gets rendered.
    var key=rows.join(',');
    if(glyphCache.has(key))return glyphCache.get(key);
    var painted=rows.reduce(function(s,b){return s+BITS[b]},0);
    if(!painted)return 32;
    var bestId=32,bestScore=1e9;
    for(var id=0;id<512;id++){
      var missing=0,extra=0;
      var base=id*8;
      for(var y=0;y<8;y++){
        var wanted=rows[y],glyph=ROM[base+y];
        missing+=BITS[wanted&(~glyph&255)];
        extra+=BITS[glyph&(~wanted&255)];
      }
      // Prefer recognizable graphic shapes over incidental alphabet glyphs
      // on ties; but let all 512 participate in real matching.
      var gfx=(id%256>=64&&id%256<128)||(id%256>=192);
      var score=missing*4+extra+(gfx?0:0.15);
      if(score<bestScore){bestScore=score;bestId=id}
    }
    // Some non-axis shapes cannot be represented by a single ROM glyph.
    // A sparse, deterministic mix of odd PETSCII graphic symbols is
    // intentional rather than attempting a new hand-drawn pixel image.
    if(bestScore>24 && (rows[0]+rows[2]*3+rows[5]*5)%9===0){
      bestId=[95,97,101,110,122,127,161,222,265,352,444,501][
        (rows[1]+rows[4]+rows[7])%12];
    }
    if(glyphCache.size>1500)glyphCache.clear();
    glyphCache.set(key,bestId);
    return bestId;
  }
  function paintPetscii(){
    var cv=player.canvas,ctx=player.context;
    if(!cv||!ctx||typeof SID==='undefined'||typeof SID.getChannelBuffer!=='function')return;
    var palette=player.colorModes[player.colorModeIndex];
    drawAtlas(palette.line);
    var width=cv.width,height=cv.height;
    if(!width||!height)return;
    var cols=40,rows=25,cellW=width/cols,cellH=height/rows;
    ctx.imageSmoothingEnabled=false;
    ctx.fillStyle=palette.background;
    ctx.fillRect(0,0,width,height);
    var channels=player.sidHasSamples?4:3;
    var first=player.sidInfoVisible?Math.max(0,Math.ceil(220/cellW)):0;
    var bands=rows-2; // keep two text rows for the C64-like header/footer
    var rowsPer=bands/channels;
    petText(ctx,'SPOTYSID  -  PETSCII  -  512 CHARS',1*cellW,0,cellW,cellH);
    var pointsAcross=Math.max(1,(cols-first)*8);
    var bufferSize=882*2;
    var samplesPerChannel=Math.floor(bufferSize/2.8);
    for(var channel=0;channel<channels;channel++){
      var buffer=SID.getChannelBuffer(channel+1);
      if(!buffer)continue;
      var top=1+channel*rowsPer;
      var minY=Math.ceil(top),maxY=Math.floor(top+rowsPer-1);
      if(maxY<minY)continue;
      var center=(top+rowsPer/2)*8;
      var amplitude=rowsPer*8*(channel===3?0.8:7);
      // Col 0 is a ROM-written channel label, preserving a text UI.
      var label='VOICE '+String(channel+1);
      petText(ctx,label,first*cellW,minY*cellH,cellW,cellH);
      var xStart=Math.min(cols-1,first+9);
      var visibleCols=cols-xStart;
      for(var col=xStart;col<cols;col++){
        var masks=new Map(),sampleCount=samplesPerChannel;
        for(var lx=0;lx<8;lx++){
          var fraction=((col-xStart)*8+lx)/Math.max(1,visibleCols*8-1);
          var pos=Math.min(bufferSize-1,Math.floor(fraction*sampleCount));
          var sample=SID.readFloatSample(buffer,pos);
          if(!player.isPlaying&&!player.isPaused)sample=0;
          if(!Number.isFinite(sample))sample=0;
          // Only the actual source SID waveform determines target location.
          var vy=Math.round(center+sample*amplitude);
          vy=Math.max(minY*8,Math.min((maxY+1)*8-1,vy));
          var rr=Math.floor(vy/8),within=vy%8;
          if(!masks.has(rr))masks.set(rr,new Uint8Array(8));
          masks.get(rr)[within]|=(128>>lx);
        }
        masks.forEach(function(bits,rr){
          // No pixels are drawn to screen: a single complete PETSCII
          // character is chosen for each occupied character-grid cell.
          var id=bestGlyph(bits);
          blit(ctx,id,col*cellW,rr*cellH,cellW,cellH);
        });
      }
    }
    petText(ctx,'*** C64 CHARACTER OSCILLOSCOPE ***',1*cellW,(rows-1)*cellH,cellW,cellH);
  }

  // Add a real ROM-character facade to short textual interface controls.
  // Original DOM labels and their click/keyboard/focus semantics are retained.
  // When COLOR 11 is deselected, facades disappear with no DOM mutation to
  // playback or playlists.
  function candidateNodes(){
    return document.querySelectorAll(
      '#sidControls button,.dialog .title,.dialog .buttons button,'+
      '#chooseSidDialog button,#ricoLivePlaylistHeader button,'+
      '#ricoRemixBar button,#ricoHelpDialog button,'+
      '#sidInfoContent .rico-show-heading,'+
      '#ricoCommunityTabs button,#ricoCommunityItems button'
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
    getMatch:bestGlyph
  };
})();