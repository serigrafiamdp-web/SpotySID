/* TEST450: isolated D81 proof of concept, no runtime compatibility certification.
 * Fresh 1581 image builder (no external library). SHA256 lookup is from approved TEST92 D81.
 * Only the per-collection fade table is patched; original player and SID files remain unchanged.
 */
(function(){'use strict';
function decode64(s){const abc="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";let a=[],v=0,n=0;for(const c of s.replace(/\s/g,"").replace(/=+$/,"")){const x=abc.indexOf(c);if(x<0)throw Error("bad base64");v=(v<<6)|x;n+=6;if(n>=8){n-=8;a.push(v>>n&255)}}return Uint8Array.from(a)}
function equal(a,b){return a.length===b.length&&a.every((v,i)=>v===b[i])}
function hex(a){return Array.from(a,v=>v.toString(16).padStart(2,"0")).join("")}
function patchPlayer(master,indices){
  if(master.length!==15014||indices.length<1||indices.length>100)throw Error("TEST92 length or count");
  const p=master.slice(),high=new Set(master.subarray(13607,13616));p.fill(0,13507,13607);p.fill(255,13607,13616);
  let j=0;indices.forEach((idx,i)=>{if(!Number.isInteger(idx)||idx<0||idx>=100)throw Error("Unverified SID");p[13507+i]=master[13507+idx];if(high.has(idx)){if(j===9)throw Error("High-address table capacity");p[13607+j++]=i}});
  return p;
}
function buildD81(files){
  const d=new Uint8Array(819200),used=new Set(),off=(t,s)=>{if(t<1||t>80||s<0||s>=40)throw Error("Sector bounds");return ((t-1)*40+s)*256},key=(t,s)=>t*40+s;
  function reserve(t,s){const k=key(t,s);if(used.has(k))throw Error("Duplicate sector");used.add(k);return off(t,s)}
  function nameAt(o,name,n){d.fill(160,o,o+n);for(let i=0;i<Math.min(n,name.length);i++)d[o+i]=name.charCodeAt(i)&127}
  if(!files.length||files.length>101)throw Error("Directory limit");
  const h=reserve(40,0),b1=reserve(40,1),b2=reserve(40,2);d.set([40,3,68,0],h);nameAt(h+4,"SPOTYSID TEST",16);d[h+20]=160;d[h+21]=160;d.set([55,51,160,51,68,160,160],h+22);
  d.set([40,2,68,187,55,51,192,0],b1);d.set([0,255,68,187,55,51,192,0],b2);
  const dirs=[];for(let i=0;i<Math.ceil(files.length/8);i++)dirs.push(reserve(40,3+i));
  dirs.forEach((o,i)=>{d[o]=i+1<dirs.length?40:0;d[o+1]=i+1<dirs.length?4+i:255});
  let t=1,s=0;function alloc(){if(t===40)t=41;if(t>80)throw Error("Disk full");const q=[t,s,reserve(t,s)];if(++s===40){s=0;t++}return q}
  files.forEach((f,i)=>{if(!(f.data instanceof Uint8Array)||!f.data.length)throw Error("Empty file");const count=Math.ceil(f.data.length/254),chain=Array.from({length:count},alloc);
    chain.forEach(([t,s,o],j)=>{const chunk=f.data.subarray(j*254,(j+1)*254);d[o]=j+1<count?chain[j+1][0]:0;d[o+1]=j+1<count?chain[j+1][1]:chunk.length+1;d.set(chunk,o+2)});
    const o=dirs[i>>3]+(i%8)*32;d[o+2]=130;d[o+3]=chain[0][0];d[o+4]=chain[0][1];nameAt(o+5,f.name,16);d[o+30]=count&255;d[o+31]=count>>8;
  });
  for(let t=1;t<=80;t++){const o=(t<=40?b1:b2)+16+((t-1)%40)*6;let free=0;for(let s=0;s<40;s++){if(!used.has(key(t,s))){d[o+1+(s>>3)]|=1<<(s&7);free++}}d[o]=free}
  return d;
}
function verifyD81(d,files){
  if(d.length!==819200)throw Error("Size");const seen=new Set(),off=(t,s)=>{if(t<1||t>80||s<0||s>=40)throw Error("Invalid chain");return ((t-1)*40+s)*256};
  function take(t,s){const o=off(t,s);if(seen.has(o))throw Error("Chain overlap");seen.add(o);return o}
  const h=take(40,0),b1=take(40,1),b2=take(40,2);let t=d[h],s=d[h+1],rows=[];
  while(t){const o=take(t,s);if(t!==40)throw Error("Directory off track");for(let i=0;i<8;i++){const r=o+i*32;if(d[r+2])rows.push(r)}t=d[o];s=d[o+1]}
  if(rows.length!==files.length)throw Error("Entry count");
  rows.forEach((r,i)=>{if(d[r+2]!==130)throw Error("File type");const f=files[i];let a=d[r+3],b=d[r+4],n=0,bytes=[];const name=Array.from(d.subarray(r+5,r+21)).filter(v=>v!==160).map(v=>String.fromCharCode(v)).join("");if(name!==f.name.slice(0,16))throw Error("Filename");
    while(a){if(a===40)throw Error("File on directory track");const o=take(a,b);a=d[o];b=d[o+1];if(!a&&(b<2||b>255))throw Error("Last sector length");bytes.push(...d.subarray(o+2,a?o+256:o+b+1));n++}
    if(n!==(d[r+30]|d[r+31]<<8)||!equal(Uint8Array.from(bytes),f.data))throw Error("File payload");
  });
  for(let t=1;t<=80;t++){const o=(t<=40?b1:b2)+16+((t-1)%40)*6;let free=0;for(let s=0;s<40;s++){const bit=(d[o+1+(s>>3)]>>(s&7))&1;if(bit===Number(seen.has(off(t,s))))throw Error("BAM mismatch");free+=bit}if(free!==d[o])throw Error("BAM count")}
  return true;
}
const hashes=decode64("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");
if(hashes.length!==3200)throw Error('Invalid TEST92 manifest');
const map=new Map();for(let i=0;i<100;i++)map.set(hex(hashes.subarray(i*32,(i+1)*32)),i);
async function digest(bytes){return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)))}
async function match(bytes){const i=map.get(await digest(bytes));return i===undefined?-1:i}
function bytesFromHex(s){return Uint8Array.from(s.match(/../g),x=>parseInt(x,16))}
function patchTimers(p){
 if(p.length!==15014||p[14755]!==0x4c||p[14756]!==0xe0||p[14757]!==0x42)throw Error("TEST92 timer installer guard");
 const out=p.slice();
 for(const [offset,hex] of [[14756,"60"],[14854,"a9208dca308d1a3aa9808dcb30a9948d1b3aa9428dcc308d1c3a4ce042"],[14886,"088a48a687a58620a84268aa28ad013060"],[14906,"088a48ae7b3ead7a3e20a84268aa28ad0b3e60"],[14926,"488a4a4a4a4a09308d16018a290f09308d170168484a4a4a4a09308d190168290f09308d1a0160"]]){
   const bytes=bytesFromHex(hex);
   if(offset!==14756&&out.subarray(offset,offset+bytes.length).some(x=>x!==0))throw Error("Timer helper region occupied");
   out.set(bytes,offset);
 }
 return out;
}
function exportSeconds(seconds){
 if(seconds===null||seconds===undefined||!Number.isInteger(seconds)||seconds<=0)return 185;
 if(seconds<15||seconds>5999)throw Error("Length outside experimental 00:15–99:59 range");
 return seconds;
}
function injectLength(bytes,seconds){
 if(!(bytes instanceof Uint8Array)||bytes.length<127||bytes[0]!==80||bytes[1]!==83||bytes[2]!==73||bytes[3]!==68||bytes[4]!==0||bytes[5]!==2||bytes[6]!==0||bytes[7]!==124||bytes[122]!==0||bytes[123]!==0)throw Error("Expected original single-chip PSID v2");
 const value=exportSeconds(seconds),out=bytes.slice(),bcd=n=>((Math.floor(n/10)<<4)|(n%10));
 out[122]=bcd(value%60);out[123]=bcd(Math.floor(value/60));return out;
}
async function exportD81(records,name,signal){
  const response=await fetch('assets/sidplay64mix/test92/00player.prg',{signal});
  if(!response.ok)throw Error('MASTER unavailable');
  const master=new Uint8Array(await response.arrayBuffer());
  if(await digest(master)!=='b718b6a3efdb59d8993f5132cbbcb4c84a1aa2f110ab1591553f391198dfd1db')throw Error('MASTER hash mismatch');
  const indices=[];let highCount=0;const high=new Set(master.subarray(13607,13616));
  for(const rec of records){const i=await match(rec.bytes);if(i<0||i!==rec.result.masterIndex)throw Error('Unverified SID');indices.push(i);if(high.has(i))highCount++}
  if(highCount>9)throw Error('Too many special-address SIDs');
  const files=[{name:'00player.prg',data:patchTimers(patchPlayer(master,indices))}];
  records.forEach((r,i)=>{const title=(r.item.name||r.item.file||'sid').toLowerCase().replace(/\.sid$/,'').replace(/[^a-z0-9_-]/g,'_').slice(0,8);files.push({name:String(i+1).padStart(3,'0')+'-'+title+'.sid',data:injectLength(r.bytes,r.seconds)})});
  const disk=buildD81(files);verifyD81(disk,files);
  if(signal&&signal.aborted)throw Error('Cancelled');
  const url=URL.createObjectURL(new Blob([disk],{type:'application/octet-stream'}));const a=document.createElement('a');a.href=url;a.download='SPOTYSID_TEST450_'+String(name||'playlist').replace(/[^a-z0-9_-]/gi,'_').slice(0,60)+'.d81';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  return files.length-1;
}
window.RicoDiskTest={match,exportD81};
})();
