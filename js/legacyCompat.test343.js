/* TEST343 — Optional low-CPU audio/oscilloscope profile for Windows XP.
 * Runs BEFORE sidPlayer.js so the ScriptProcessor buffer is chosen once.
 * Default mode is untouched on modern browsers. The browser UA may be spoofed
 * by Supermium; ?xp=1 forces the profile and ?xp=0 disables it.
 */
(function () {
  'use strict';
  var ua=String(navigator.userAgent||'');
  var override=null;
  try { override=new URLSearchParams(window.location.search).get('xp'); }
  catch (ignore) {}
  var oscpu=String(navigator.oscpu||'');
  var reportedXP=/Windows NT 5\.[12]\b|Windows XP/i.test(ua+' '+oscpu);
  // TEST346: Supermium reports NT 10/Win 11 on real XP installations.
  // A deliberate per-browser selection is safer than guessing the OS.
  var XP_PREFERENCE_KEY='spotysid.legacyOS.confirmedXP.v1';
  var savedXP=false;
  try { savedXP=window.localStorage.getItem(XP_PREFERENCE_KEY)==='1'; }
  catch (ignore) { /* storage can be disabled */ }
  var forcedByUrl=override==='1'||override==='on';
  var disabledByUrl=override==='0'||override==='off';
  var forced=forcedByUrl||(!disabledByUrl&&savedXP);
  var enabled=!disabledByUrl&&(reportedXP||forced);
  var browser=/Supermium/i.test(ua)?'Supermium':
    /Edg\//i.test(ua)?'Edge':/Firefox\//i.test(ua)?'Firefox':
    /Chrome\//i.test(ua)?'Chromium/Chrome-compatible':'Other/unknown';
  var profile={
    enabled:enabled,
    browserReported:browser,
    windowsXPReported:reportedXP,
    forced:forced,
    savedXP:savedXP,
    overrideSource:forcedByUrl?'url':disabledByUrl?'url-off':savedXP?'saved':'browser',
    bufferSamples:enabled?8192:4096,
    scopeMaxFps:enabled?20:0
  };
  window.SpotySidLegacy=profile;
  if(window.console&&console.info)console.info('SpotySid TEST346 compatibility',profile);
  // TEST345: report the OS/version offered by browser APIs rather than
  // silently pretending that every Chromium/NT 10.0 User-Agent is Windows 11.
  // Supermium can deliberately spoof both UA and Client Hints even on XP.
  function syncVersion(text,reason) {
    profile.reportedWindows=text;
    profile.versionSource=reason;
    var node=document.getElementById('ricoWindowsVersion');
    if(!node)return;
    node.textContent=text;
    node.title=reason+(profile.enabled?
      ' | XP-compatible audio mode ON.':' | XP-compatible audio mode OFF.')+
      (profile.enabled?' Click to return to automatic detection.':
        ' Click here if this computer really runs Windows XP.');
    node.setAttribute('aria-label',node.title);
  }
  function installOsSelection(){
    var node=document.getElementById('ricoWindowsVersion');
    if(!node)return;
    function chooseXP(){
      // This is an explicit local preference, never a hardware detection.
      var targetXP=!profile.enabled;
      var stored=false;
      try{
        if(targetXP)window.localStorage.setItem(XP_PREFERENCE_KEY,'1');
        else window.localStorage.removeItem(XP_PREFERENCE_KEY);
        stored=true;
      }catch(ignore){ /* use URL fallback when storage is blocked */ }
      // Remove old query overrides when preference is available, preserving
      // playlist share links and all other URL parameters.
      var url;
      try{
        url=new URL(window.location.href);
        url.searchParams.delete('xp');
        if(!stored)url.searchParams.set('xp',targetXP?'1':'0');
        window.location.assign(url.href);
      }catch(error){
        // Even on an older browser, never switch buffer size mid-playback.
        window.location.search='xp='+(targetXP?'1':'0');
      }
    }
    node.addEventListener('click',chooseXP,false);
    node.addEventListener('keydown',function(event){
      if(event.key==='Enter'||event.key===' '||event.key==='Spacebar'){
        event.preventDefault();
        chooseXP();
      }
    },false);
  }
  function readVersion(){
    installOsSelection();
    var label='WIN ?',reason='Windows version not verifiable from browser metadata';
    var nt=/Windows NT (\d+)\.(\d+)/i.exec(oscpu+' '+ua);
    if(forced){
      label='XP';
      reason=forcedByUrl?
        'XP profile selected by ?xp=1 (not independently detected)':
        'Windows XP manually confirmed and saved for this browser (not independently detected)';
    }else if(reportedXP){
      label='XP';
      reason='Windows XP/NT 5.x reported in browser metadata';
    }else if(nt){
      var v=nt[1]+'.'+nt[2];
      if(v==='6.1'){label='7';reason='Windows 7 reported by browser';}
      else if(v==='6.2'){label='8';reason='Windows 8 reported by browser';}
      else if(v==='6.3'){label='8.1';reason='Windows 8.1 reported by browser';}
      else if(v==='10.0'){label='10/11?';reason='Browser reports Windows NT 10.0 (ambiguous between 10 and 11; Supermium may spoof XP)';}
    }
    syncVersion(label,reason);
    // Client Hints is optional. Version >= 13 normally means Windows 11;
    // Supermium can provide FALSE OS hints, so this is a browser report only.
    var hints=navigator.userAgentData;
    if(!forced&&!reportedXP&&hints&&typeof hints.getHighEntropyValues==='function'){
      try{
        var p=hints.getHighEntropyValues(['platform','platformVersion']);
        if(p&&typeof p.then==='function'){
          p.then(function(data){
            if(!data||data.platform!=='Windows')return;
            var major=parseInt(String(data.platformVersion||'').split('.')[0],10);
            if(!isFinite(major))return;
            if(major>=13)syncVersion('11?',
              'Browser reports Windows 11, but Supermium can spoof this on Windows XP (unverified)');
            else if(major>=1&&major<=10)syncVersion('10?',
              'Browser reports Windows 10, but Supermium can spoof this on Windows XP (unverified)');
          }).catch(function(){ /* keep the honest 10/11? or WIN ? */ });
        }
      }catch(ignore){ /* Client Hints not available */ }
    }
  }
  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded',readVersion,false);
  else readVersion();
  if(!enabled)return;

  // ScriptProcessor runs on the UI thread on these browsers. Fewer canvas
  // redraws leave more time for SID synthesis and ZIP/playlist transitions.
  // Audio, AUTO timing, input, keyboard and the MOS/PLAYLIST UI keep running.
  function installScopeThrottle(){
    var player=window.sidPlayer;
    if(!player||typeof player.render!=='function')return;
    var originalRender=player.render;
    var lastPaint=-Infinity,lastMode=null;
    player.render=function(){
      var now=window.performance&&typeof window.performance.now==='function'
        ?window.performance.now():Date.now();
      var mode=this.scopeDisplayMode||'hires';
      if(mode!==lastMode||now-lastPaint>=50){
        lastPaint=now;
        lastMode=mode;
        return originalRender.apply(this,arguments);
      }
    };
  }
  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded',installScopeThrottle,false);
  else installScopeThrottle();
})();
