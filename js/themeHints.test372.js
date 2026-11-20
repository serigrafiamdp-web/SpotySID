/* TEST372 — one themed hint for every DOM title, including dynamically
   created playlist, toolbar and dialog controls. The browser's native title
   tooltip has an OS-controlled white background and cannot be styled.
   Keep original text/accessible labels; replace visual hover/focus hints only.
   Existing reorder hints already use a themed helper and are left untouched.
   ES5 syntax to retain the Windows XP compatibility path. */
(function(){
  'use strict';
  if(!document.body)return;
  var tooltip=document.createElement('div');
  tooltip.id='ricoThemedHint';
  tooltip.setAttribute('role','tooltip');
  tooltip.setAttribute('aria-live','off');
  tooltip.hidden=true;
  document.body.appendChild(tooltip);

  var current=null,pending=null,focusMode=false;
  var mouseX=0,mouseY=0,ignoreMouseUntil=0;
  function transfer(node){
    if(!node||node.nodeType!==1||!node.hasAttribute('title'))return;
    var text=node.getAttribute('title');
    if(text&&text.trim()){
      node.setAttribute('data-rico-themed-hint',text);
      // Preserve accessible names for icon-only controls whose title was
      // previously their only textual description.
      if(!node.hasAttribute('aria-label')&&!node.hasAttribute('aria-labelledby')&&
         (node.tagName==='BUTTON'||node.getAttribute('role')==='button')&&
         !String(node.textContent||'').trim())
        node.setAttribute('aria-label',text);
    }else node.removeAttribute('data-rico-themed-hint');
    node.removeAttribute('title');
  }
  function find(target){
    var node=target;
    if(node&&node.nodeType===3)node=node.parentElement;
    var first=null;
    while(node&&node.nodeType===1){
      transfer(node);
      if(!first&&node.getAttribute('data-rico-themed-hint'))first=node;
      // TEST405: walk through Shadow DOM, used by the second and pinned
      // playlist windows. The old event.target stops at the window host.
      if(node.parentElement)node=node.parentElement;
      else{
        var root=node.getRootNode&&node.getRootNode();
        node=root&&root.host||null;
      }
    }
    return first;
  }
  function eventOrigin(event){
    var path=event.composedPath&&event.composedPath();
    return path&&path.length?path[0]:event.target;
  }
  function hide(){
    if(pending!==null){clearTimeout(pending);pending=null;}
    tooltip.hidden=true;current=null;focusMode=false;
  }
  function position(){
    if(tooltip.hidden||!current)return;
    var x=mouseX+13,y=mouseY+17;
    if(focusMode){
      var r=current.getBoundingClientRect();
      x=r.left+6;y=r.bottom+8;
    }
    var width=tooltip.offsetWidth,height=tooltip.offsetHeight;
    if(x+width+7>window.innerWidth)x=Math.max(5,window.innerWidth-width-7);
    if(y+height+7>window.innerHeight){
      y=focusMode?current.getBoundingClientRect().top-height-8:mouseY-height-13;
    }
    tooltip.style.left=Math.max(5,Math.round(x))+'px';
    tooltip.style.top=Math.max(5,Math.round(y))+'px';
  }
  function start(node,focused){
    if(!node){hide();return;}
    if(current===node&&focusMode===focused)return;
    hide();
    current=node;focusMode=focused;
    pending=setTimeout(function(){
      pending=null;
      if(!current||!current.isConnected)return;
      var text=current.getAttribute('data-rico-themed-hint');
      if(!text)return;
      tooltip.textContent=text;
      tooltip.hidden=false;
      position();
    },230);
  }
  // TEST405: native white browser tooltips cannot be styled, especially
  // inside a ShadowRoot. Convert copied playlist titles to themed hints.
  window.ricoPrepareShadowHints=function(shadow){
    if(!shadow||!shadow.querySelectorAll)return;
    var elements=shadow.querySelectorAll('[title]');
    for(var j=0;j<elements.length;j++)transfer(elements[j]);
  };
  // Closing MOS and opening a second playlist can strand two old hint
  // balloons over the oscilloscope. Always dismiss them on the handoff.
  window.ricoDismissTransientHints=function(){
    ignoreMouseUntil=Date.now()+650;
    hide();
    var reorder=document.getElementById('ricoReorderHint');
    if(reorder)reorder.style.display='none';
  };
  // One initial pass removes native title popups from the controls already
  // rendered. Newly inserted rows are handled on first mouseover/focus.
  var initial=document.querySelectorAll('[title]');
  for(var i=0;i<initial.length;i++)transfer(initial[i]);

  document.addEventListener('mouseover',function(event){
    if(Date.now()<ignoreMouseUntil)return;
    mouseX=event.clientX;mouseY=event.clientY;
    start(find(eventOrigin(event)),false);
  },true);
  document.addEventListener('mousemove',function(event){
    if(Date.now()<ignoreMouseUntil)return;
    mouseX=event.clientX;mouseY=event.clientY;
    var node=find(eventOrigin(event));
    if(node!==current)start(node,false);
    else if(!tooltip.hidden&&!focusMode)position();
  },true);
  document.addEventListener('mouseout',function(event){
    var to=find(event.relatedTarget);
    if(to!==current)hide();
  },true);
  document.addEventListener('focusin',function(event){
    var node=find(eventOrigin(event));
    if(node)start(node,true);
  },true);
  document.addEventListener('focusout',function(event){
    if(focusMode&&current&&eventOrigin(event)===current)hide();
  },true);
  document.addEventListener('mousedown',hide,true);
  document.addEventListener('touchstart',function(){
    ignoreMouseUntil=Date.now()+850;
    hide();
  },true);
  document.addEventListener('scroll',hide,true);
  document.addEventListener('keydown',function(event){
    if(event.key==='Escape'||event.key==='Esc')hide();
  },true);
  window.addEventListener('blur',hide);
  window.addEventListener('resize',hide);

  // Dynamic code updates some button titles as its state changes (e.g.
  // RANDOM ON/OFF). Strip those new native titles immediately too.
  if(typeof MutationObserver!=='undefined'){
    var observer=new MutationObserver(function(records){
      for(var j=0;j<records.length;j++){
        var node=records[j].target;
        if(node.hasAttribute&&node.hasAttribute('title')){
          transfer(node);
          if(node===current&&!tooltip.hidden){
            tooltip.textContent=node.getAttribute('data-rico-themed-hint')||'';
            position();
          }
        }
      }
    });
    // No childList observer: progressive 1000+ SID lists must remain fast.
    observer.observe(document.body,{subtree:true,attributes:true,
      attributeFilter:['title']});
  }
})();
