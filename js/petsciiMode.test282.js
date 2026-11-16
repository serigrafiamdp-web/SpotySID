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
  var lastIsPetscii=null;

  function enabled(){
    // TEST289: independent PETSCII button works with every COLOR palette.
    return player.petsciiEnabled === true;
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
  // TEST285 — True PETSCII path construction, NEVER bitmap similarity.
  // Every visible tile is a genuine unmodified C64 ROM glyph selected only
  // by the DIRECTION and CONTINUITY of the SID's audio signal.
  // C64 uppercase/graphics charset character codes (8x8 ROM):
  var SCOPE_GLYPH=Object.freeze({
    horizontal:64,      // two-row horizontal bar
    vertical:93,        // centered two-column vertical bar
    rising:78,          // / rising on screen (toward the upper rows)
    falling:77,         // \ falling on screen (toward the lower rows)
    noise:42,           // genuine C64 '*' character for SID noise waveform
    idle:100            // authentic C64 ROM: one-pixel full-width horizontal line
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

    // TEST289: 14px square PETSCII glyphs (approx. 138 columns at 1920px).
    // Use the exact current COLOR palette for ink and background.
    var cellSize=14;
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
    // TEST294: keep a one-ROM-pixel baseline in channels with no output.
    function drawIdleLine(top,bottom){
      var row=Math.round((top+bottom)/2);
      for(var col=0;col<cols;col++)
        blit(ctx,SCOPE_GLYPH.idle,col*cellW,row*cellH,cellW,cellH);
    }
    for(var channel=0;channel<channels;channel++){
      var buffer=SID.getChannelBuffer(channel+1);
      // TEST293: use the SID's noise flag, not sample jaggedness.
      // TinySID may return a 4-bit waveform nibble or raw SID control bits.
      var wave=channel<3&&typeof SID.getWave==='function'?SID.getWave(channel):0;
      var noiseWave=Number.isFinite(wave)&&
        (wave<=15?(wave&8)!==0:(wave&0x80)!==0);
      var top=Math.floor(channel*rows/channels);
      var bottom=Math.floor((channel+1)*rows/channels)-1;
      if(bottom<top)continue;
      // TEST298: paused/stopped playback must not visualize stale audio
      // buffers. On Pause the old isPaused flag remains true, but audio
      // playback has stopped and the channel must be a clean idle line.
      if(!player.isPlaying||!buffer){drawIdleLine(top,bottom);continue;}

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
        if(!player.isPlaying)sample=0;
        if(!Number.isFinite(sample))sample=0;
        samples[i]=sample;
        if(sample<min)min=sample;
        if(sample>max)max=sample;
      }
      // TEST297: isolated residual impulses were producing 14px vertical
      // ticks and specks on otherwise silent channels. Detect the sustained
      // signal using central percentiles instead of the two extreme samples.
      var ordered=Array.prototype.slice.call(samples).sort(function(a,b){return a-b;});
      var low=ordered[Math.floor((count-1)*0.05)];
      var high=ordered[Math.ceil((count-1)*0.95)];
      var range=high-low,mid=(low+high)/2;
      var center=(top+bottom)/2;
      var heightInRows=Math.max(0,bottom-top-1);
      // TEST292: stable gain retains real SID amplitude instead of
      // renormalizing each frame, capped at 48% of the voice band.
      var gain=heightInRows*10;
      var maxDeviation=heightInRows*0.24;
      // A silent voice (or an isolated spike without sustained amplitude)
      // uses only the one-pixel C64 horizontal glyph.
      var inactive=!player.isPlaying||(channel<3&&wave===0);
      if(inactive||range<0.00015||range*gain<2.75){
        drawIdleLine(top,bottom);
        continue;
      }
      // Ignore outlier impulses during drawing, too, so they cannot be
      // mistaken for abrupt square-wave transitions.
      for(var s=0;s<count;s++)
        samples[s]=Math.max(low,Math.min(high,samples[s]));
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
        var deviation=(valueAt(position)-mid)*gain;
        return center+Math.max(-maxDeviation,Math.min(maxDeviation,deviation));
      }
      function tile(id,col,row){
        if(row<top||row>bottom)return;
        blit(ctx,id,col*cellW,row*cellH,cellW,cellH);
      }

      for(var col=0;col<cols;col++){
        var from=col*(count-1)/cols;
        var to=(col+1)*(count-1)/cols;
        var y0=yAt(from),y1=yAt(to),delta=y1-y0;
        // A sub-character variation is a continuous thin baseline,
        // never a vertical bar/cross or stray dot.
        if(Math.max(Math.abs(y0-center),Math.abs(y1-center))<1.25){
          tile(SCOPE_GLYPH.idle,col,Math.round(center));
          continue;
        }
        if(noiseWave){
          // Actual SID noise amplitude determines the '*' tile position.
          tile(SCOPE_GLYPH.noise,col,Math.round(yAt((from+to)/2)));
          continue;
        }
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

  // TEST289: interface text remains native (same font and same layout).
  // No label canvas, DOM observer, or theme-specific font overrides here.
  var originalRender=player.render;
  player.render=function(){
    var active=enabled();
    if(lastIsPetscii!==active){
      lastIsPetscii=active;
      // Paint immediately on toggle, including if the first frame is <40ms.
      lastPaint=-Infinity;
    }
    if(active){
      var now=performance.now();
      if(now-lastPaint>=40){
        lastPaint=now;
        paintPetscii();
      }
      if(typeof this.updateVoiceInfo==='function')this.updateVoiceInfo();
      return;
    }
    // Switching PETSCII OFF restores the existing native waveform renderer.
    return originalRender.apply(this,arguments);
  };
  window.RicoPetsciiMode={
    enabled:enabled,
    glyphCount:ROM.length/8,
    // Retain a harmless refresh method for compatibility; UI font unchanged.
    refresh:function(){lastPaint=-Infinity;},
    scopeGlyphs:SCOPE_GLYPH
  };
})();
