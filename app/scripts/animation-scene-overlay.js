const $ = (id) => document.getElementById(id);

const state = {
  base: null,
  frames: [],
  index: 0,
  timer: null,
  playing: false,
  speed: 140,
  target: 4,
  scale: 100,
  x: 50,
  y: 50,
  drag: null,
};

const els = {
  name: $('overlaySceneName'), target: $('overlayFrameTarget'), speed: $('overlaySpeed'), speedValue: $('overlaySpeedValue'),
  scale: $('overlayScale'), scaleValue: $('overlayScaleValue'), x: $('overlayX'), xValue: $('overlayXValue'), y: $('overlayY'), yValue: $('overlayYValue'),
  baseDrop: $('baseOverlayDrop'), baseInput: $('baseOverlayInput'), baseName: $('baseOverlayName'),
  frameDrop: $('overlayFramesDrop'), frameInput: $('overlayFramesInput'), frameStatus: $('overlayFramesStatus'),
  stage: $('overlayStage'), basePreview: $('overlayBasePreview'), framePreview: $('overlayFramePreview'), empty: $('overlayEmpty'), counter: $('overlayFrameCounter'), grid: $('overlayFrameGrid'),
  playA: $('playOverlayBtn'), playB: $('overlayPlayBtn'), prev: $('overlayPrevBtn'), next: $('overlayNextBtn'), clear: $('clearOverlayFramesBtn'), reset: $('resetOverlayToolBtn'), export: $('exportOverlayManifestBtn'),
};

function revoke(item){ if(item?.url?.startsWith('blob:')) URL.revokeObjectURL(item.url); }
function stop(){ clearInterval(state.timer); state.timer=null; state.playing=false; [els.playA,els.playB].forEach(b=>{if(b)b.textContent='▶ PLAY';}); }

function applyTransform(){
  els.framePreview.style.left = `${state.x}%`;
  els.framePreview.style.top = `${state.y}%`;
  els.framePreview.style.transform = `translate(-50%, -50%) scale(${state.scale/100})`;
  els.scaleValue.textContent = state.scale;
  els.xValue.textContent = state.x;
  els.yValue.textContent = state.y;
  els.scale.value = state.scale;
  els.x.value = state.x;
  els.y.value = state.y;
}

function render(){
  els.speedValue.textContent=String(state.speed);
  els.frameStatus.textContent=`${state.frames.length} / ${state.target} frames loaded`;
  if(state.base){ els.basePreview.src=state.base.url; els.basePreview.hidden=false; els.baseName.textContent=state.base.name; els.empty.hidden=true; }
  else { els.basePreview.hidden=true; els.baseName.textContent='No scene loaded'; els.empty.hidden=false; }

  const frame=state.frames[state.index];
  if(frame){ els.framePreview.src=frame.url; els.framePreview.hidden=false; els.counter.textContent=`FRAME ${state.index+1} / ${state.frames.length}`; }
  else { els.framePreview.hidden=true; els.counter.textContent='FRAME 0 / 0'; }
  applyTransform();

  if(!state.frames.length){ els.grid.innerHTML='<div class="overlay-empty-card">Upload transparent animation frames. They play in filename order.</div>'; return; }
  els.grid.innerHTML='';
  state.frames.forEach((item,i)=>{
    const card=document.createElement('button'); card.type='button'; card.className=`overlay-frame-card${i===state.index?' active':''}`;
    card.innerHTML=`<img src="${item.url}" alt="Overlay frame ${i+1}"><strong>FRAME ${String(i+1).padStart(2,'0')}</strong><small>${item.name}</small>`;
    card.addEventListener('click',()=>{state.index=i;render();}); els.grid.appendChild(card);
  });
}

function tick(){ if(!state.frames.length)return; state.index=(state.index+1)%state.frames.length; render(); }
function play(){ if(!state.frames.length)return; if(state.playing){stop();return;} state.playing=true; [els.playA,els.playB].forEach(b=>{if(b)b.textContent='■ STOP';}); state.timer=setInterval(tick,state.speed); }
function loadBase(file){ if(!file)return; revoke(state.base); state.base={name:file.name,url:URL.createObjectURL(file)}; render(); }
function loadFrames(fileList){ const files=[...fileList].filter(f=>f.type.startsWith('image/')); if(!files.length)return; stop(); state.frames.forEach(revoke); state.frames=files.sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'})).slice(0,state.target).map(file=>({name:file.name,url:URL.createObjectURL(file)})); state.index=0; render(); }

function setPosFromPointer(e){
  const r=els.stage.getBoundingClientRect();
  state.x=Math.max(0,Math.min(100,Math.round(((e.clientX-r.left)/r.width)*100)));
  state.y=Math.max(0,Math.min(100,Math.round(((e.clientY-r.top)/r.height)*100)));
  applyTransform();
}

els.framePreview.addEventListener('pointerdown',e=>{ if(!state.frames.length)return; state.drag=e.pointerId; els.framePreview.setPointerCapture(e.pointerId); els.framePreview.classList.add('dragging'); setPosFromPointer(e); });
els.framePreview.addEventListener('pointermove',e=>{ if(state.drag===e.pointerId)setPosFromPointer(e); });
function endDrag(e){ if(state.drag!==e.pointerId)return; state.drag=null; els.framePreview.classList.remove('dragging'); }
els.framePreview.addEventListener('pointerup',endDrag); els.framePreview.addEventListener('pointercancel',endDrag);

function downloadJSON(){
  const manifest={version:2,type:'scene-overlay-animation',name:els.name.value.trim()||'Overlay Scene',scene:state.base?.name||null,frameCount:state.frames.length,targetFrameCount:state.target,frameHoldMs:state.speed,loop:true,transform:{xPercent:state.x,yPercent:state.y,scalePercent:state.scale},frames:state.frames.map((f,i)=>({index:i+1,file:f.name,holdMs:state.speed}))};
  const blob=new Blob([JSON.stringify(manifest,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${manifest.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'overlay-scene'}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}

els.baseDrop.addEventListener('click',()=>els.baseInput.click()); els.baseInput.addEventListener('change',e=>loadBase(e.target.files[0]));
els.frameDrop.addEventListener('click',()=>els.frameInput.click()); els.frameInput.addEventListener('change',e=>loadFrames(e.target.files));
els.target.addEventListener('change',()=>{state.target=Number(els.target.value);if(state.frames.length>state.target){stop();state.frames.slice(state.target).forEach(revoke);state.frames=state.frames.slice(0,state.target);state.index=Math.min(state.index,Math.max(0,state.frames.length-1));}render();});
els.speed.addEventListener('input',()=>{state.speed=Number(els.speed.value);if(state.playing){stop();play();}render();});
els.scale.addEventListener('input',()=>{state.scale=Number(els.scale.value);applyTransform();});
els.x.addEventListener('input',()=>{state.x=Number(els.x.value);applyTransform();});
els.y.addEventListener('input',()=>{state.y=Number(els.y.value);applyTransform();});
els.playA.addEventListener('click',play); els.playB.addEventListener('click',play);
els.prev.addEventListener('click',()=>{if(!state.frames.length)return;stop();state.index=(state.index-1+state.frames.length)%state.frames.length;render();});
els.next.addEventListener('click',()=>{stop();tick();});
els.clear.addEventListener('click',()=>{stop();state.frames.forEach(revoke);state.frames=[];state.index=0;els.frameInput.value='';render();});
els.reset.addEventListener('click',()=>{stop();revoke(state.base);state.frames.forEach(revoke);Object.assign(state,{base:null,frames:[],index:0,speed:140,target:4,scale:100,x:50,y:50,drag:null});els.name.value='My Overlay Scene';els.target.value='4';els.speed.value='140';els.baseInput.value='';els.frameInput.value='';render();});
els.export.addEventListener('click',downloadJSON);

['dragenter','dragover'].forEach(type=>[els.baseDrop,els.frameDrop].forEach(el=>el.addEventListener(type,e=>{e.preventDefault();el.classList.add('dragging');})));
['dragleave','drop'].forEach(type=>[els.baseDrop,els.frameDrop].forEach(el=>el.addEventListener(type,e=>{e.preventDefault();el.classList.remove('dragging');})));
els.baseDrop.addEventListener('drop',e=>loadBase(e.dataTransfer.files[0])); els.frameDrop.addEventListener('drop',e=>loadFrames(e.dataTransfer.files));

render();
