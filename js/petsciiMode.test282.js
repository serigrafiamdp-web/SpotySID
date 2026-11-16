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
  // TEST284: only graphical PETSCII codes are valid for the OSCILLOSCOPE.
  // Full 512-character C64 ROM remains available; deliberately exclude
  // alphabet, numbers and their inverse variants from the wave itself.
  // These codes include authentic diagonals 77 (\) and 78 (/), verticals
  // 66/71/72/84/89/93/101/103, horizontal bars 64/68/69/70/82/99/100.
  var graphicCodes=[];
  for(var id=0;id<512;id++){
    var code=id&255;
    if((code>=64&&code<=127)||(code>=192&&code<=255))
      graphicCodes.push(id);
  }
  function bestGlyph(rows){
    // Match a rasterized signal segment to ONE genuine 8x8 ROM glyph.
    // Rasterized masks are templates only; visible output is a full C64
    // character blitted from the ROM atlas, not points/lines on the canvas.
    var key=rows.join(',');
    if(glyphCache.has(key))return glyphCache.get(key);
    var painted=rows.reduce(function(sum,b){return sum+BITS[b]},0);
    if(!painted)return 32;
    var bestId=64,bestScore=Infinity;
    for(var n=0;n<graphicCodes.length;n++){
      var id=graphicCodes[n],base=id*8,missing=0,extra=0;
      for(var y=0;y<8;y++){
        var wanted=rows[y],glyph=ROM[base+y];
        missing+=BITS[wanted&(~glyph&255)];
        extra+=BITS[glyph&(~wanted&255)];
      }
      // Preserve the drawn edge of the SID wave: missing ink hurts much
      // more than modest overdraw. A nearly full block is not a line.
      var score=missing*6+extra*1.35;
      // Strongly prefer the authentic slash/backslash and bars when their
      // shapes match, instead of incidental checkerboard/letter-like blocks.
      if(id===77||id===78)score-=1.7;
      if(id===64||id===66||id===68||id===69||id===70||
         id===71||id===72||id===82||id===84||id===89||id===93||
         id===99||id===100||id===101||id===103||id===106)score-=1.4;
      if(score<bestScore){bestScore=score;bestId=id;}
    }
    // Badly matching wave segments still use real graphic codes; no text
    // or random alphabet character is ever introduced in the scope.
    if(glyphCache.size>3600)glyphCache.clear();
    glyphCache.set(key,bestId);
    return bestId;
  }
  function paintPetscii(){
    var cv=player.canvas,ctx=player.context;
    if(!cv||!ctx||typeof SID==='undefined'||
       typeof SID.getChannelBuffer!=='function')return;
    var palette=player.colorModes[player.colorModeIndex];
    drawAtlas(palette.line);
    var width=cv.width,height=cv.height;
    if(width<=0||height<=0)return;

    // PC resolution: NO 40x25 restriction. Every visible glyph retains its
    // 8:8 aspect ratio. As the display grows, MORE characters are rendered,
    // not stretched. At 1920px, ~160 columns vs the old fixed 40.
    var targetCell=12;
    var cols=Math.max(1,Math.ceil(width/targetCell));
    var rows=Math.max(1,Math.ceil(height/targetCell));
    var cellW=width/cols,cellH=height/rows;
    ctx.imageSmoothingEnabled=false;
    ctx.fillStyle=palette.background;
    ctx.fillRect(0,0,width,height);
    var channels=player.sidHasSamples?4:3;
    var bufferSize=882*2;
    var count=Math.floor(bufferSize/2.8);
    var totalX=cols*8;

    for(var channel=0;channel<channels;channel++){
      var buffer=SID.getChannelBuffer(channel+1);
      if(!buffer)continue;
      var minRow=Math.floor(channel*rows/channels);
      var maxRow=Math.floor((channel+1)*rows/channels)-1;
      if(maxRow<minRow)continue;

      // Stabilize the beginning of the waveform at a positive zero-crossing,
      // as the original SID scope does; do not replace real audio with a
      // synthetic triangle, pulse or sawtooth.
      var offset=0,searchStart=Math.floor(count/2);
      var searchEnd=Math.min(bufferSize-count,searchStart+count);
      var prevSample=SID.readFloatSample(buffer,searchStart);
      for(var k=searchStart+1;k<=searchEnd;k++){
        var nextSample=SID.readFloatSample(buffer,k);
        if(prevSample<=0&&nextSample>0){
          offset=Math.max(0,Math.min(bufferSize-count,k-Math.floor(count/8)));
          break;
        }
        prevSample=nextSample;
      }
      var samples=new Float32Array(count);
      var min=Infinity,max=-Infinity;
      for(var i=0;i<count;i++){
        var sample=SID.readFloatSample(buffer,offset+i);
        if(!player.isPlaying&&!player.isPaused)sample=0;
        if(!Number.isFinite(sample))sample=0;
        samples[i]=sample;
        if(sample<min)min=sample;
        if(sample>max)max=sample;
      }
      var bandTop=minRow*8,bandBottom=(maxRow+1)*8-1;
      var center=(bandTop+bandBottom)/2;
      var dynamicRange=max-min;
      var scale=dynamicRange>0.000001?
        (bandBottom-bandTop)*0.78/dynamicRange:0;
      var middle=(max+min)/2;
      function sampleAt(x){
        var position=x*(count-1)/Math.max(1,totalX-1);
        var index=Math.floor(position),fraction=position-index;
        var a=samples[index],b=samples[Math.min(count-1,index+1)];
        // An abrupt SID pulse edge (or sawtooth reset) is a step, NOT an
        // interpolated diagonal. Smooth ramps still interpolate naturally.
        var discontinuity=dynamicRange>0.000001 &&
          Math.abs(b-a)>dynamicRange*0.27;
        var value=discontinuity?(fraction<0.5?a:b):a+(b-a)*fraction;
        return Math.max(bandTop,Math.min(bandBottom,
          Math.round(center+(value-middle)*scale)));
      }
      var lastY=sampleAt(0);
      for(var col=0;col<cols;col++){
        var masks=new Map();
        function put(x,y){
          if(y<bandTop||y>bandBottom)return;
          var row=Math.floor(y/8),inside=y%8;
          var bits=masks.get(row);
          if(!bits){bits=new Uint8Array(8);masks.set(row,bits);}
          bits[inside]|=(128>>(x&7));
        }
        for(var lx=0;lx<8;lx++){
          var x=col*8+lx,y=sampleAt(x);
          // Connect successive wave values in TEXT-CELL templates. Nearly
          // flat runs become horizontal bars. Steep edges produce vertical
          // ROM bars; triangular/sawtooth slopes use the two diagonal ROM
          // characters (77 & 78) and neighboring graphic codes.
          var low=Math.min(lastY,y),high=Math.max(lastY,y);
          for(var yy=low;yy<=high;yy++)put(lx,yy);
          lastY=y;
        }
        masks.forEach(function(bits,row){
          blit(ctx,bestGlyph(bits),col*cellW,row*cellH,cellW,cellH);
        });
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
    getMatch:bestGlyph
  };
})();