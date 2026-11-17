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
  var lastDisplayMode=null;
  // TEST322: one low-resolution offscreen image for PIXEL, reused every frame.
  var pixelCanvas=null,pixelContext=null;

  function enabled(){
    // TEST322: PETSCII remains its authentic independent renderer.
    return player.scopeDisplayMode === 'petscii';
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
    // TEST286: no cross/corner tiles; their extra arms created ghost lines
  });
  function paintPetscii(){
    var cv=player.canvas,ctx=player.context;
    if(!cv||!ctx||typeof SID==='undefined'||
       typeof SID.getChannelBuffer!=='function')return;
    // TEST312: PETSCII honors the same inverted ink/paper as the other waves.
    var palette=typeof player.getActivePalette==='function'?
      player.getActivePalette():player.colorModes[player.colorModeIndex];
    // TEST323: master slider scales the PETSCII waveform, not its glyphs.
    var volumeGain=Math.max(0,Math.min(2,Number(player.scopeVisualGain)));
    if(!Number.isFinite(volumeGain))volumeGain=1;
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
    for(var channel=0;channel<channels;channel++){
      var buffer=SID.getChannelBuffer(channel+1);
      if(!buffer)continue;
      // TEST302: '*' only for pure SID white noise, not instruments
      // that combine the noise bit with triangle/saw/pulse effects.
      // TinySID reports either a 4-bit waveform nibble or control bits.
      var wave=channel<3&&typeof SID.getWave==='function'?SID.getWave(channel):0;
      var noiseWave=Number.isFinite(wave)&&
        (wave<=15?wave===8:(wave&0xf0)===0x80);
      var noiseFlag=Number.isFinite(wave)&&
        (wave<=15?(wave&8)!==0:(wave&0x80)!==0);
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
      // TEST323: a muted master volume draws no waveform/noise glyphs.
      // Do not amplify tiny residual samples into a large visual mess.
      if(volumeGain===0||range<0.00015)continue;
      // TEST303: measure the actual signal. A two-level pulse/square
      // overrides noise-register changes, except for a sharply decaying
      // drum impact. The sampled audio may lag the SID register state.
      var plateau=0,flat=0,edges=0,head=0,tail=0;
      var band=range*0.14,flatLimit=range*0.075;
      var section=Math.max(1,Math.floor(count*0.20));
      for(var n=0;n<count;n++){
        var v=samples[n];
        if(Math.abs(v-min)<band||Math.abs(v-max)<band)plateau++;
        if(n>0){
          var step=Math.abs(v-samples[n-1]);
          if(step<flatLimit)flat++;
          if(step>range*0.40)edges++;
        }
        if(n<section)head+=Math.abs(v-mid);
        if(n>=count-section)tail+=Math.abs(v-mid);
      }
      var squareLike=plateau/count>=0.76 &&
        flat/Math.max(1,count-1)>=0.60 &&
        edges>=1&&edges<count*0.34;
      var percussionBurst=head/section>0.003&&head>tail*1.30;
      // Sustained melodic squares stay normal, including if a noise
      // bit is also set. Drum-like decays may use '*' with any noise bit.
      var showNoiseStar=noiseFlag&&
        ((noiseWave&&!squareLike)||percussionBurst);
      var center=(top+bottom)/2;
      var heightInRows=Math.max(0,bottom-top-1);
      // TEST292: stable gain based on actual SID output, not each frame's
      // min/max. An envelope getting quieter now draws a smaller waveform.
      // Keep the TEST289 maximum height of 48% of the voice band.
      var gain=heightInRows*10*volumeGain;
      var maxDeviation=heightInRows*0.24*volumeGain;
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
        if(showNoiseStar){
          // Actual SID amplitude locates the star for pure white noise
          // or a fast percussive burst; square melodies draw normally.
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

  // TEST322: PIXEL renders the SAME native waveform at 1/3 resolution,
  // then scales nearest-neighbor to the regular canvas. Binary thresholding
  // removes ALL antialias RGB/alpha values: exactly background + ink from the
  // active normal/inverted palette. FILL / LINE still use their original math.
  var originalRender=player.render;
  function paintPixel(){
    var canvas=player.canvas,context=player.context;
    if(!canvas||!context||typeof player.getActivePalette!=='function')return;
    var width=canvas.width,height=canvas.height;
    if(width<1||height<1)return;
    var pixelSize=3;
    var pw=Math.max(1,Math.ceil(width/pixelSize));
    var ph=Math.max(1,Math.ceil(height/pixelSize));
    if(!pixelCanvas){
      pixelCanvas=document.createElement('canvas');
      pixelContext=pixelCanvas.getContext('2d',{willReadFrequently:true});
      if(!pixelContext)return;
    }
    if(pixelCanvas.width!==pw)pixelCanvas.width=pw;
    if(pixelCanvas.height!==ph)pixelCanvas.height=ph;
    pixelContext.setTransform(pw/width,0,0,ph/height,0,0);
    pixelContext.clearRect(0,0,width,height);
    // Call the existing LINE or FILL engine with a temporary drawing target.
    // Never resize the actual oscilloscope or replace its canvas in the DOM.
    player.context=pixelContext;
    try{
      originalRender.call(player);
    }finally{
      player.context=context;
      pixelContext.setTransform(1,0,0,1,0,0);
    }
    var palette=player.getActivePalette();
    function rgb(hex){
      return [parseInt(hex.slice(1,3),16),
        parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];
    }
    var ink=rgb(palette.line),paper=rgb(palette.background);
    var frame=pixelContext.getImageData(0,0,pw,ph),data=frame.data;
    // LINE gets a slightly lower coverage threshold to preserve fine peaks.
    // The result is an opaque two-color image, including antialiased edges.
    var threshold=player.oscilloscopeMode==='line'?64:112;
    for(var i=0;i<data.length;i+=4){
      var shade=data[i+3]>=threshold?ink:paper;
      data[i]=shade[0];
      data[i+1]=shade[1];
      data[i+2]=shade[2];
      data[i+3]=255;
    }
    pixelContext.putImageData(frame,0,0);
    context.imageSmoothingEnabled=false;
    context.clearRect(0,0,width,height);
    context.drawImage(pixelCanvas,0,0,pw,ph,0,0,width,height);
  }

  // TEST322: Cycle HI-RES > PETSCII > PIXEL without changing interface fonts.
  player.render=function(){
    var mode=player.scopeDisplayMode||'hires';
    if(lastDisplayMode!==mode){
      lastDisplayMode=mode;
      // First frame of each mode must draw immediately after clicking.
      lastPaint=-Infinity;
    }
    if(mode==='petscii'||mode==='pixel'){
      var now=performance.now();
      if(now-lastPaint>=40){
        lastPaint=now;
        if(mode==='petscii')paintPetscii();
        else paintPixel();
      }
      if(mode==='petscii'&&typeof this.updateVoiceInfo==='function')
        this.updateVoiceInfo();
      return;
    }
    return originalRender.apply(this,arguments);
  };
  window.RicoPetsciiMode={
    enabled:enabled,
    glyphCount:ROM.length/8,
    refresh:function(){lastPaint=-Infinity;},
    scopeGlyphs:SCOPE_GLYPH
  };
})();
