/* TEST433: non-modal D81 preflight. Candidate status is not playback certification.
 * Export stays disabled until a playlist-independent player is available. */
(function(){
'use strict';
function inspectSID(bytes){
  function bad(reason){return {ok:false,reason:reason};}
  if(!(bytes instanceof Uint8Array)||bytes.length<127)return bad('INVALID SID');
  function word(i){return bytes[i]*256+bytes[i+1];}
  if(String.fromCharCode.apply(null,bytes.subarray(0,4))!=='PSID')return bad('RSID / NON PSID');
  if(word(4)!==2||word(6)!==124||word(8)!==0)return bad('HEADER / LOAD FORMAT');
  if(bytes[122]||bytes[123]||(word(118)&2))return bad('MULTI SID / PSID SPECIFIC');
  if(((word(118)>>2)&3)===2)return bad('NTSC ONLY');
  if(word(14)<1||word(14)>256||word(16)<1||word(16)>word(14))return bad('SUBTUNE HEADER');
  var load=bytes[124]+256*bytes[125],init=word(10),play=word(12),end=load+bytes.length-126;
  if(!play||!init)return bad('PLAY / INIT ZERO');
  if(init<load||init>=end||play<load||play>=end)return bad('VECTORS OUTSIDE PAYLOAD');
  if(load<0x1000||end>0x3000||(load&255)===255)return bad('OUTSIDE CURRENT SAFE BANK');
  return {ok:true,load:load,init:init,play:play,sub:word(16)-1,blocks:Math.ceil(bytes.length/254)};
}
function resizeRect(r,edge,dx,dy,vw,vh){
  var margin=4,minW=Math.min(340,Math.max(1,vw-2*margin)),minH=Math.min(240,Math.max(1,vh-2*margin));
  var l=r.left,t=r.top,rr=r.left+r.width,b=r.top+r.height;
  if(edge.indexOf('w')>=0)l=Math.max(margin,Math.min(rr-minW,l+dx));
  if(edge.indexOf('e')>=0)rr=Math.min(vw-margin,Math.max(l+minW,rr+dx));
  if(edge.indexOf('n')>=0)t=Math.max(margin,Math.min(b-minH,t+dy));
  if(edge.indexOf('s')>=0)b=Math.min(vh-margin,Math.max(t+minH,b+dy));
  return {left:l,top:t,width:rr-l,height:b-t};
}
function newCapacity(format){
  return {available:(format==='D64'?664:3160)-Math.ceil(14700/254),used:0,accepted:0,rejected:0,overflow:0,known:0};
}
function placeCandidate(state,result,seconds){
  if(!result.ok){state.rejected++;return 'SKIP · '+result.reason;}
  if(state.accepted>=162||state.used+result.blocks>state.available){state.overflow++;return 'SKIP · DISK / PLAYER LIMIT';}
  state.accepted++;state.used+=result.blocks;
  if(Number.isInteger(seconds)&&seconds>0)state.known++;
  return 'CANDIDATE · '+(Number.isInteger(seconds)&&seconds>0?Math.floor(seconds/60)+':'+('0'+seconds%60).slice(-2):'03:05 DEFAULT');
}
var generation=0,panel=null,controller=null;
function el(tag,text,cls){var n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function close(){generation++;if(controller)controller.abort();controller=null;if(panel)panel.remove();panel=null;}
document.addEventListener('keydown',function(e){if(panel&&panel.contains(document.activeElement)&&(e.key==='Escape'||e.key==='Esc')){e.preventDefault();e.stopImmediatePropagation();close();}},true);
function open(config){
  close();var token=generation;controller=new AbortController();var signal=controller.signal;
  var p=el('aside',undefined,'rico-d81-panel');panel=p;p.id='ricoD81Panel';
  p.setAttribute('role','dialog');p.setAttribute('aria-modal','false');p.setAttribute('aria-label','Your selected playlist on a real C64');
  var header=el('div',undefined,'rico-d81-header');header.appendChild(el('strong','YOUR SELECTED PLAYLIST ON A REAL C64'));
  var x=el('button','X');x.type='button';x.setAttribute('aria-label','Close CREATE C64 DISK');x.onclick=close;header.appendChild(x);p.appendChild(header);
  var body=el('div',undefined,'rico-d81-body');p.appendChild(body);
  var intro=el('div',undefined,'rico-d81-intro');
  intro.appendChild(el('div','EXPORT A C64 DISK WITH SIDPLAY64 SID MIX MOD BY RICO','rico-d81-headline'));
  var playlist=el('div',undefined,'rico-d81-playlist');
  var playlistName=el('span',config.name||'PLAYLIST','rico-d81-title');
  playlistName.title=config.name||'PLAYLIST';
  playlist.appendChild(playlistName);
  var curator=el('span','Playlist by '+(config.creator||'Unknown curator'),'rico-d81-curator');
  curator.title=curator.textContent;
  playlist.appendChild(curator);
  playlist.appendChild(el('span','('+config.items.length+' SIDS)','rico-d81-total'));
  intro.appendChild(playlist);
  body.appendChild(intro);
  var format=null,results=[],state=null,scanning=false,started=false;
  var step=el('div','CHOOSE A DISK FORMAT!','rico-d81-step');body.appendChild(step);
  var formatBar=el('div',undefined,'rico-d81-format');formatBar.setAttribute('role','group');formatBar.setAttribute('aria-label','Disk format');
  var formatButtons={};
  ['D64','D81'].forEach(function(kind){
    var button=el('button',kind+(kind==='D64'?' / 1541':' / 1581'));
    button.type='button';button.setAttribute('aria-pressed',String(kind===format));
    button.onclick=function(){
      if(kind===format)return;
      format=kind;updateFormat();
      if(!started){scan.onclick();return;}
      replayResults();
    };
    formatButtons[kind]=button;formatBar.appendChild(button);
  });
  body.appendChild(formatBar);
  var estimates=el('div',undefined,'rico-d81-estimates rico-d81-note');
  estimates.textContent='D64: ~20–40 / D81: ~80–150 SIDs + player';
  estimates.title='Actual SID count depends on compatibility and file sizes.';
  body.appendChild(estimates);
  body.appendChild(el('div','TEST84B · COMPATIBILITY CHECK'));
  var status=el('div','SELECT D64 OR D81 · '+config.items.length+' SID','rico-d81-status');status.setAttribute('role','status');body.appendChild(status);
  var list=el('div',undefined,'rico-d81-list');body.appendChild(list);
  list.appendChild(el('div','CHOOSE A FORMAT TO CHECK YOUR PLAYLIST','rico-d81-empty'));
  body.appendChild(el('div','Export pending generic fade / timer support. Candidates require playback validation.','rico-d81-note'));
  var actions=el('div',undefined,'rico-d81-actions'),scan=el('button','CHECK SIDS');scan.type='button';scan.disabled=true;actions.appendChild(scan);
  var download=el('button','EXPORT DISK');download.type='button';download.disabled=true;actions.appendChild(download);body.appendChild(actions);
  document.body.appendChild(p);

  // TEST433D: explicit edge and corner handles, independent of native CSS resize.
  // Pointer capture keeps resizing active even when the pointer crosses the list.
  ['n','s','e','w','ne','nw','se','sw'].forEach(function(edge){
    var grip=el('div',undefined,'rico-d81-resize rico-d81-resize-'+edge);
    grip.setAttribute('aria-hidden','true');
    var start=null;
    grip.addEventListener('pointerdown',function(e){
      if(e.button!==0)return;
      var r=p.getBoundingClientRect();
      start={id:e.pointerId,x:e.clientX,y:e.clientY,rect:{left:r.left,top:r.top,width:r.width,height:r.height}};
      p.style.left=r.left+'px';p.style.top=r.top+'px';
      p.style.width=r.width+'px';p.style.height=r.height+'px';p.style.transform='none';
      if(grip.setPointerCapture)grip.setPointerCapture(e.pointerId);
      e.preventDefault();e.stopPropagation();
    });
    grip.addEventListener('pointermove',function(e){
      if(!start||e.pointerId!==start.id)return;
      var r=resizeRect(start.rect,edge,e.clientX-start.x,e.clientY-start.y,window.innerWidth,window.innerHeight);
      p.style.left=r.left+'px';p.style.top=r.top+'px';p.style.width=r.width+'px';p.style.height=r.height+'px';
      e.preventDefault();e.stopPropagation();
    });
    ['pointerup','pointercancel','lostpointercapture'].forEach(function(n){
      grip.addEventListener(n,function(){start=null;});
    });
    p.appendChild(grip);
  });
  var drag=null;
  header.addEventListener('pointerdown',function(e){if(e.button!==0||e.target.closest('button'))return;var r=p.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top};if(header.setPointerCapture)header.setPointerCapture(e.pointerId);e.preventDefault();});
  header.addEventListener('pointermove',function(e){if(!drag||e.pointerId!==drag.id)return;p.style.left=Math.max(4,Math.min(innerWidth-p.offsetWidth-4,drag.left+e.clientX-drag.x))+'px';p.style.top=Math.max(4,Math.min(innerHeight-p.offsetHeight-4,drag.top+e.clientY-drag.y))+'px';p.style.transform='none';});
  ['pointerup','pointercancel','lostpointercapture'].forEach(function(n){header.addEventListener(n,function(){drag=null;});});
  p.addEventListener('keydown',function(e){e.stopPropagation();});
  function updateFormat(){
    Object.keys(formatButtons).forEach(function(kind){formatButtons[kind].setAttribute('aria-pressed',String(kind===format));});
    if(!format){
      download.textContent='EXPORT DISK';scan.disabled=true;return;
    }
    download.textContent='EXPORT '+format;
  }
  function paintResult(record){
    var label=placeCandidate(state,record.result,record.seconds);
    var row=el('div',undefined,'rico-d81-row');
    row.appendChild(el('span',(record.index+1)+'. '+(record.item.name||record.item.file||'SID')));
    row.appendChild(el('span',label));list.appendChild(row);
  }
  function updateStatus(){
    status.textContent=(scanning?results.length+'/'+config.items.length+' · ':'')+
      state.accepted+' CANDIDATES · '+state.rejected+' REJECTED · '+state.overflow+' LIMIT · '+
      state.used+'/'+state.available+' BLOCKS · '+state.known+' KNOWN TIMES';
  }
  function replayResults(){
    if(!format)return;
    state=newCapacity(format);list.textContent='';
    results.forEach(paintResult);updateStatus();
  }
  scan.onclick=async function(){
    if(!format||scanning)return;
    started=true;scanning=true;scan.disabled=true;results=[];replayResults();
    for(var i=0;i<config.items.length;i++){
      if(signal.aborted||token!==generation)return;
      var item=config.items[i],result,seconds=null;
      try{var bytes=await config.read(item,signal);result=inspectSID(bytes);}
      catch(e){result={ok:false,reason:'SID UNAVAILABLE'};}
      if(result.ok){try{seconds=await config.duration(item,result.sub);}catch(e){}}
      if(signal.aborted||token!==generation)return;
      var record={index:i,item:item,result:result,seconds:seconds};
      results.push(record);paintResult(record);updateStatus();
      if(i%8===7)await new Promise(function(resolve){setTimeout(resolve,0);});
    }
    scanning=false;updateStatus();
    if(token===generation&&!signal.aborted)scan.disabled=false;
  };
  updateFormat();
}
window.RicoD81={open:open,inspectSID:inspectSID};
})();
