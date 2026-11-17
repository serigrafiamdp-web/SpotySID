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
    var ids=['ricoRemixEditor','ricoImportSidWindow','ricoDonateDialog'];
    for(var j=0;j<ids.length;j++){
      if(isVisible(document.getElementById(ids[j])))return true;
    }
    return false;
  }

  // Handle only Esc. Preserve existing modal-editor and beta-key Esc handling.
  document.addEventListener('keydown',function(event){
    if((event.key!=='Escape'&&event.key!=='Esc')||
       event.defaultPrevented||event.repeat)return;
    if(hasOtherForegroundWindow())return;
    if(isVisible(chooser)){
      var manager=window.sidPlayer&&window.sidPlayer.dialogManager;
      if(!manager||manager.dialogShown!=='chooseSidDialog')return;
      manager.hideDialog('chooseSidDialog');
      sync();
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if(isVisible(playlist)){
      // The X button opens the library again. The existing PLAYLIST toggle,
      // instead, simply hides the playlist, keeping the oscilloscope/audio.
      var toggle=document.getElementById('ricoPlaylistToggle');
      if(!toggle)return;
      toggle.click();
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },true);

  // TEST313 — single-letter player shortcuts. Reuse the existing
  // buttons so playlist state, wave rendering and ★ inversion remain
  // exactly the same as a mouse click. Do not hijack text editing.
  document.addEventListener('keydown',function(event){
    if(event.defaultPrevented||event.repeat||event.isComposing||
       event.ctrlKey||event.metaKey||event.altKey)return;
    var key=String(event.key||'').toLowerCase();
    if(key!=='p'&&key!=='c')return;
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
    var target=document.getElementById(key==='p'?
      'ricoPlaylistToggle':'oscilloscopeColorButton');
    if(!target)return;
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
