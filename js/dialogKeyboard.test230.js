/* TEST230 — Nonmodal Choose A SID, Esc priority: browser then playlist.
   Keyboard changes only visibility. Never loads/unloads SIDs or changes audio. */
(function(){
  'use strict';
  var chooser=document.getElementById('chooseSidDialog');
  var playlist=document.getElementById('ricoLivePlaylist');
  var controls=document.getElementById('sidControls');
  if(!chooser||!playlist||!controls)return;

  function isVisible(node){
    return !!(node&&node.getClientRects().length&&
      window.getComputedStyle(node).visibility!=='hidden');
  }
  function sync(){
    document.body.classList.toggle('rico-choose-open',isVisible(chooser));
    document.body.style.setProperty('--rico-controls-height',
      Math.ceil(controls.getBoundingClientRect().height||36)+'px');
  }
  var observer=new MutationObserver(sync);
  observer.observe(chooser,{attributes:true,attributeFilter:['style','class']});
  if(typeof ResizeObserver!=='undefined'){
    var barObserver=new ResizeObserver(sync);
    barObserver.observe(controls);
  }
  window.addEventListener('resize',sync);
  sync();

  // TEST231: screenshot-matched initial geometry (782 x 726 at desktop).
  // Remember later user resizing/moving; do not let showDialog's content-height
  // calculation silently reset the chosen dimensions on each open.
  var geometryKey='spotysid:choose-window:v1';
  function readGeometry(){
    try{
      var value=JSON.parse(localStorage.getItem(geometryKey)||'null');
      return value&&Number.isFinite(value.width)&&Number.isFinite(value.height)&&
        value.width>=280&&value.width<4000&&value.height>=260&&value.height<4000
        ?value:null;
    }catch(error){return null;}
  }
  function applyGeometry(){
    var saved=readGeometry();
    var barHeight=Math.ceil(controls.getBoundingClientRect().height||36);
    var top=Math.max(8,Math.min(saved&&Number.isFinite(saved.top)?saved.top:12,
      Math.max(8,window.innerHeight-barHeight-280)));
    var width=Math.max(280,Math.min(saved?saved.width:782,window.innerWidth-24));
    var height=Math.max(260,Math.min(saved?saved.height:726,
      window.innerHeight-top-barHeight-12));
    var centered=Math.round((window.innerWidth-width)/2);
    var left=Math.max(0,Math.min(saved&&Number.isFinite(saved.left)?saved.left:centered,
      window.innerWidth-width));
    chooser.style.width=Math.round(width)+'px';
    chooser.style.height=Math.round(height)+'px';
    chooser.style.left=Math.round(left)+'px';
    chooser.style.top=Math.round(top)+'px';
  }
  function saveGeometry(){
    try{
      var rect=chooser.getBoundingClientRect();
      if(rect.width<280||rect.height<260)return;
      localStorage.setItem(geometryKey,JSON.stringify({
        width:Math.round(rect.width),height:Math.round(rect.height),
        left:Math.round(rect.left),top:Math.round(rect.top)
      }));
    }catch(error){}
  }
  var manager=window.sidPlayer&&window.sidPlayer.dialogManager;
  if(manager&&typeof manager.showDialog==='function'){
    var originalShowDialog=manager.showDialog;
    manager.showDialog=function(id){
      var result=originalShowDialog.apply(this,arguments);
      if(id==='chooseSidDialog')applyGeometry();
      return result;
    };
  }
  // The original player opens Choose before this module loads.
  applyGeometry();
  var userDraggingChooser=false;
  chooser.addEventListener('mousedown',function(event){
    if(event.button!==0||event.target.closest('button'))return;
    if(event.target.closest('.title,.dialogResize'))userDraggingChooser=true;
  },true);
  window.addEventListener('mouseup',function(){
    if(!userDraggingChooser)return;
    userDraggingChooser=false;
    saveGeometry();
  });
  window.addEventListener('resize',function(){
    if(isVisible(chooser))applyGeometry();
  });

  function hasOtherForegroundWindow(){
    var dialogs=document.querySelectorAll('.dialog');
    for(var i=0;i<dialogs.length;i++){
      if(dialogs[i]!==chooser&&isVisible(dialogs[i]))return true;
    }
    // Karaoke Settings is deliberately nonmodal in TEST383; do not block
    // K, Play, N, W or other shortcuts while it remains open.
    var ids=['ricoRemixEditor','ricoImportSidWindow','ricoDonateDialog','ricoKeysPanel'];
    for(var j=0;j<ids.length;j++){
      if(isVisible(document.getElementById(ids[j])))return true;
    }
    return false;
  }

  // TEST340 — ESC closes the foreground list BEFORE it can open MOS.
  // PLAYLIST -> its existing X (return to OSC); MOS -> close MOS;
  // OSC with no menu -> open MOS. TILEWORK keeps its exit confirmation.
  document.addEventListener('keydown',function(event){
    if((event.key!=='Escape'&&event.key!=='Esc')||
       event.defaultPrevented||event.repeat)return;
    // A floating Karaoke Settings panel owns ESC; do not open MOS behind it.
    var settings=document.getElementById('ricoKaraokeConfigOverlay');
    if(settings&&!settings.hidden)return;
    if(hasOtherForegroundWindow()||
       isVisible(document.getElementById('ricoTileArtworkOverlay')))return;
    if(isVisible(playlist)){
      // Reuse the PLAYLIST X action, including its current playback-safe
      // close behavior. ESC must NOT open MOS in the same keypress.
      var closePlaylist=document.getElementById('ricoLiveClose');
      if(!closePlaylist)return;
      event.preventDefault();
      event.stopImmediatePropagation();
      closePlaylist.click();
      return;
    }
    if(isVisible(chooser)){
      var manager=window.sidPlayer&&window.sidPlayer.dialogManager;
      if(!manager||manager.dialogShown!=='chooseSidDialog')return;
      manager.hideDialog('chooseSidDialog');
      sync();
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    var focused=document.activeElement;
    // Only visible text fields block ESC from opening MOS. A focused TIMER
    // inside a now-hidden playlist must not block the OSC shortcut.
    if(isVisible(focused)&&(focused.isContentEditable||
       /^(INPUT|TEXTAREA|SELECT)$/.test(focused.tagName||'')||
       (focused.closest&&focused.closest(
         '[contenteditable="true"],[contenteditable=""],[role="textbox"],[role="combobox"]'))))
      return;
    var mos=document.getElementById('chooseSid');
    if(!mos)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    mos.click();
  },true);

  // TEST373 — W cycles HI-RES / PETSCII / PIXEL / OFF through the existing
  // display button. Preserve N/D/I/F/M/P/C, editing and foreground guards.
  // Reuse the already validated XP-safe manual/AUTO SID handoff pipeline.
  document.addEventListener('keydown',function(event){
    if(event.defaultPrevented||event.repeat||event.isComposing||
       event.ctrlKey||event.metaKey||event.altKey)return;
    var key=String(event.key||'').toLowerCase();
    if(key!=='p'&&key!=='c'&&key!=='m'&&key!=='i'&&key!=='f'&&key!=='d'&&key!=='n'&&key!=='w'&&key!=='k')return;
    var focused=document.activeElement;
    var source=event.target;
    function editable(node){
      if(!node||node.nodeType!==1)return false;
      if(node.isContentEditable)return true;
      if(node.closest&&node.closest('[contenteditable="true"],[contenteditable=""],[role="textbox"]'))
        return true;
      return /^(INPUT|TEXTAREA|SELECT)$/.test(node.tagName||'');
    }
    if(editable(source)||editable(focused))return;
    if(hasOtherForegroundWindow()||
       isVisible(document.getElementById('ricoTileArtworkOverlay')))
      return;
    // TEST382: K toggles only an existing Karaoke cover.
    // Never hijack editing, browser/search, dialogs, or unrelated SIDs.
    if(key==='k'){
      var kara=window.SpotySidKaraoke;
      var data=window.SpotySidKaraokeMidi;
      var player=window.sidPlayer;
      if(!kara||!data||!player||isVisible(chooser))return;
      if(kara.isActive()){
        event.preventDefault();kara.close();return;
      }
      var index=player.sidListIndex;
      var item=typeof index==='number'&&player.sidList&&player.sidList[index];
      var ref=item&&item._hvscRef;
      var available=!!(item&&((ref&&ref.file===data.sidFile&&ref.pack===data.sidPack)||
        (item.file===data.sidFile&&/uctumi|palladino/i.test(item.author||''))));
      if(!available)return;
      event.preventDefault();
      kara.open(item,index);
      if(isVisible(playlist)){
        var closePlaylist=document.getElementById('ricoLiveClose');
        if(closePlaylist)closePlaylist.click();
      }
      return;
    }
    var shortcutButtons={
      p:'ricoPlaylistToggle',c:'oscilloscopeColorButton',m:'chooseSid',
      i:'ricoInvertColorsButton',f:'oscilloscopeModeButton',
      d:'ricoToolbarTileArtworkButton',n:'nextSid',
      w:'ricoPetsciiButton'
    };
    var target=document.getElementById(shortcutButtons[key]);
    if(!target||target.disabled)return;
    event.preventDefault();
    target.click();
  },true);

  // TEST333 — UP / DOWN choose only a playable playlist or SID song.
  // ENTER dispatches the same existing PLAY/click action; browsing never
  // starts playback by merely moving the keyboard selection.
  // Other tabs, search inputs, select boxes, song timers and text fields
  // keep their own keyboard behavior.
  var keyboardRow=null;
  function clearKeyboardRow(){
    if(keyboardRow)keyboardRow.classList.remove('rico-keyboard-current');
    keyboardRow=null;
  }
  function keyboardEditable(element){
    if(!element||element.nodeType!==1)return false;
    if(element.isContentEditable)return true;
    if(element.closest&&element.closest(
      '[contenteditable="true"],[contenteditable=""],[role="textbox"],[role="combobox"]'))
      return true;
    return /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName||'');
  }
  function keyboardList(){
    if(isVisible(chooser)){
      // Only the active list pane, never the upper category tabs/toolbar.
      var panes=[
        ['ricoCommunityPanel','ricoCommunityItems','.rico-community-row'],
        ['sidListHolder','sidList','.rico-game-row,.rico-local-row'],
        ['ricoHvscPanel','ricoHvscItems','button.rico-hvsc-row,button.rico-csdb-rank-head,.rico-csdb-detail:not([hidden]) .rico-csdb-track button'],
        ['ricoOurCollectionPanel','ricoOurItems','.rico-our-collection-row']
      ];
      for(var i=0;i<panes.length;i++){
        var box=document.getElementById(panes[i][0]);
        var container=document.getElementById(panes[i][1]);
        if(isVisible(box)&&container)
          return {container:container,selector:panes[i][2]};
      }
      return null;
    }
    if(isVisible(playlist)){
      var songs=document.getElementById('ricoLivePlaylistItems');
      if(songs)return {container:songs,selector:'button.rico-live-row'};
    }
    return null;
  }
  function keyboardRows(list){
    var nodes=list.container.querySelectorAll(list.selector);
    return Array.prototype.filter.call(nodes,function(node){
      // Rankings contain hidden expandable details: exclude their songs
      // until that ranking has been expanded. No forced reflow of 1000+ rows.
      return !node.closest('[hidden]')&&
        !node.classList.contains('rico-csdb-pending-row');
    });
  }
  function showKeyboardRow(row){
    if(keyboardRow!==row)clearKeyboardRow();
    keyboardRow=row;
    row.classList.add('rico-keyboard-current');
    row.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  // TEST337: MOS opens with its FIRST visible playlist ready for ENTER.
  // The Community catalog is fetched asynchronously, so select immediately
  // when rows exist and retry when the catalog replaces its loading message.
  // Never synthesize PLAY or alter the currently playing SID.
  function selectFirstMosRow(){
    if(!isVisible(chooser)||!chooser.classList.contains('rico-view-community'))return;
    var list=keyboardList();
    if(!list||list.container.id!=='ricoCommunityItems')return;
    var rows=keyboardRows(list);
    if(!rows.length)return;
    if(keyboardRow&&rows.indexOf(keyboardRow)>=0)return;
    showKeyboardRow(rows[0]);
  }
  var mosButton=document.getElementById('chooseSid');
  if(mosButton)mosButton.addEventListener('click',function(){
    // Each MOS opening starts at position 1, not the previous keyboard row.
    clearKeyboardRow();
    selectFirstMosRow();
  });
  var mosItems=document.getElementById('ricoCommunityItems');
  if(mosItems){
    var mosListObserver=new MutationObserver(selectFirstMosRow);
    mosListObserver.observe(mosItems,{childList:true});
  }
  // Also cover a Choose window that was already open on initial page load.
  selectFirstMosRow();

  function playKeyboardRow(row){
    if(!row||!row.isConnected)return;
    if(row.classList.contains('rico-community-row')||
       row.classList.contains('rico-our-collection-row')){
      // The PLAY button is not always the first button: reorder controls
      // and EDIT/DELETE must never fire when ENTER is pressed.
      var buttons=row.querySelectorAll('button');
      for(var i=0;i<buttons.length;i++){
        if(buttons[i].textContent.trim().toUpperCase()==='PLAY'){
          if(!buttons[i].disabled)buttons[i].click();
          return;
        }
      }
      return;
    }
    // GAMES, HVSC, CSDb and floating song rows use their normal click handler.
    if(typeof row.click==='function')row.click();
  }
  document.addEventListener('keydown',function(event){
    if(event.key==='Tab'){clearKeyboardRow();return;}
    if(event.defaultPrevented||event.isComposing||event.ctrlKey||
       event.altKey||event.metaKey)return;
    var key=event.key;
    if(key!=='ArrowUp'&&key!=='ArrowDown'&&key!=='Enter')return;
    // TEST341: ENTER from a clear OSC view starts the first song of the
    // first Community playlist when none was selected. It is the same
    // action as bottom PLAY, NOT the old GAMES/legacy play toggle.
    // Keep native Enter on focused buttons/links and text editing intact.
    if(key==='Enter'&&!event.repeat&&!isVisible(chooser)&&!isVisible(playlist)&&
       !hasOtherForegroundWindow()&&
       !isVisible(document.getElementById('ricoTileArtworkOverlay'))){
      var focused=document.activeElement,source=event.target;
      function visibleInput(node){return keyboardEditable(node)&&isVisible(node);}
      function visibleAction(node){
        return !!(node&&node.nodeType===1&&isVisible(node)&&node.closest&&
          node.closest('button,a,[role="button"]'));
      }
      if(!visibleInput(source)&&!visibleInput(focused)&&
         !visibleAction(source)&&!visibleAction(focused)&&
         typeof window.ricoStartFirstCommunityIfIdle==='function'&&
         window.ricoStartFirstCommunityIfIdle()){
        event.preventDefault();event.stopImmediatePropagation();return;
      }
    }
    if(keyboardEditable(event.target)||keyboardEditable(document.activeElement)||
       hasOtherForegroundWindow()||
       isVisible(document.getElementById('ricoTileArtworkOverlay')))return;
    var list=keyboardList();
    if(!list){clearKeyboardRow();return;}
    var rows=keyboardRows(list);
    if(!rows.length){clearKeyboardRow();return;}
    var current=rows.indexOf(keyboardRow);
    if(key==='Enter'){
      if(current<0||event.repeat)return;
      event.preventDefault();event.stopImmediatePropagation();
      playKeyboardRow(rows[current]);
      return;
    }
    var step=key==='ArrowDown'?1:-1;
    if(current<0){
      // The active song or playlist is the starting position when possible.
      current=rows.findIndex(function(row){
        return row.classList.contains('rico-live-active')||
          row.classList.contains('rico-community-selected')||
          row.classList.contains('rico-active-row');
      });
      if(current<0)current=step>0?-1:rows.length;
    }
    var next=Math.max(0,Math.min(rows.length-1,current+step));
    event.preventDefault();event.stopImmediatePropagation();
    showKeyboardRow(rows[next]);
  },true);
  // TEST334: as soon as the user moves the mouse, the mouse's normal
  // :hover highlight becomes the ONE visible cursor. Avoid a second row
  // remaining highlighted by an older keyboard selection.
  document.addEventListener('pointermove',function(event){
    if(keyboardRow&&event.pointerType!=='touch')clearKeyboardRow();
  },true);
  // A mouse selection or navigating elsewhere also releases the keyboard cursor.
  document.addEventListener('pointerdown',function(event){
    if(keyboardRow&&keyboardRow!==event.target&&
       !keyboardRow.contains(event.target))clearKeyboardRow();
  },true);
})();
