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
  var reportedXP=/Windows NT 5\.[12]\b|Windows XP/i.test(ua);
  var forced=override==='1'||override==='on';
  var disabled=override==='0'||override==='off';
  var enabled=!disabled&&(reportedXP||forced);
  var browser=/Supermium/i.test(ua)?'Supermium':
    /Edg\//i.test(ua)?'Edge':/Firefox\//i.test(ua)?'Firefox':
    /Chrome\//i.test(ua)?'Chromium/Chrome-compatible':'Other/unknown';
  var profile={
    enabled:enabled,
    browserReported:browser,
    windowsXPReported:reportedXP,
    forced:forced,
    bufferSamples:enabled?8192:4096,
    scopeMaxFps:enabled?20:0
  };
  window.SpotySidLegacy=profile;
  if(window.console&&console.info)console.info('SpotySid TEST343 compatibility',profile);
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
