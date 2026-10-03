const controls = [
  ['Style Strength',70],['Detail',65],['Contrast',80],['Glow',55],['Edge Clean',60],['Skin Tone Lock',75],['Background Blend',40]
];
const presets = [
  {id:'retrowave',name:'RETROWAVE PALE BLUE',hue:190,sat:1.25,contrast:1.15,ink:1},
  {id:'noir',name:'NOIR INK',hue:0,sat:0,contrast:1.55,ink:1.5},
  {id:'neon',name:'NEON COMIC',hue:310,sat:1.65,contrast:1.25,ink:1.1},
  {id:'soft',name:'SOFT PORTRAIT',hue:18,sat:1.05,contrast:1.02,ink:.35},
  {id:'vector',name:'CLEAN VECTOR',hue:205,sat:1.15,contrast:1.3,ink:1.25},
  {id:'custom',name:'CUSTOM AI PRESET',hue:260,sat:1.3,contrast:1.2,ink:.9}
];

const $ = s => document.querySelector(s);
const controlsEl = $('#controls');
const presetGrid = $('#presetGrid');
const dropZone = $('#dropZone');
const fileInput = $('#fileInput');
const sourceImage = $('#sourceImage');
const dropPrompt = $('#dropPrompt');
const canvas = $('#renderCanvas');
const ctx = canvas.getContext('2d',{willReadFrequently:true});
let sourceBitmap = null;
let activePreset = presets[0];
let currentStep = 1;

controls.forEach(([name,value],i)=>{
  const row=document.createElement('div'); row.className='control';
  const id='c'+i;
  row.innerHTML=`<label for="${id}">${name.toUpperCase()}</label><output id="${id}o">${value}</output><input id="${id}" type="range" min="0" max="100" value="${value}">`;
  const input=row.querySelector('input');
  input.addEventListener('input',()=>{row.querySelector('output').value=input.value; if(sourceBitmap) render();});
  controlsEl.append(row);
});

function setStep(n){
  currentStep=n; $('#stepNo').textContent=n;
  document.querySelectorAll('.step').forEach(b=>b.classList.toggle('active',Number(b.dataset.step)===n));
}
document.querySelectorAll('.step').forEach(b=>b.addEventListener('click',()=>setStep(Number(b.dataset.step))));

presets.forEach((p,i)=>{
  const b=document.createElement('button');
  b.className='preset-card'+(i===0?' active':'');
  b.innerHTML=`<div class="preset-thumb"></div><strong>${p.name}</strong>`;
  b.addEventListener('click',()=>{
    activePreset=p;
    document.querySelectorAll('.preset-card').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    $('#activePresetLabel').textContent=`(${p.name})`;
    setStep(3); if(sourceBitmap) render();
  });
  presetGrid.append(b);
});

function getControl(i){return Number(document.querySelector('#c'+i).value)/100}

async function loadFile(file){
  if(!file || !file.type.startsWith('image/')) return;
  const url=URL.createObjectURL(file);
  sourceImage.src=url; sourceImage.hidden=false; dropPrompt.hidden=true;
  $('#fileName').textContent=file.name.toUpperCase();
  $('#fileSize').textContent=Math.round(file.size/1024)+' KB';
  sourceBitmap=await createImageBitmap(file);
  setStep(2); render();
}

dropZone.addEventListener('click',()=>fileInput.click());
dropZone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fileInput.click();}});
fileInput.addEventListener('change',()=>loadFile(fileInput.files[0]));
['dragenter','dragover'].forEach(ev=>dropZone.addEventListener(ev,e=>{e.preventDefault();dropZone.classList.add('dragover')}));
['dragleave','drop'].forEach(ev=>dropZone.addEventListener(ev,e=>{e.preventDefault();dropZone.classList.remove('dragover')}));
dropZone.addEventListener('drop',e=>loadFile(e.dataTransfer.files[0]));

function render(){
  if(!sourceBitmap) return;
  setStep(4);
  const max=1600, scale=Math.min(1,max/sourceBitmap.width);
  canvas.width=Math.max(1,Math.round(sourceBitmap.width*scale));
  canvas.height=Math.max(1,Math.round(sourceBitmap.height*scale));
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.filter=`contrast(${activePreset.contrast + getControl(2)*.35}) saturate(${activePreset.sat + getControl(0)*.8}) hue-rotate(${activePreset.hue}deg)`;
  ctx.drawImage(sourceBitmap,0,0,canvas.width,canvas.height);
  ctx.filter='none';
  const img=ctx.getImageData(0,0,canvas.width,canvas.height);
  const d=img.data;
  const detail=getControl(1), glow=getControl(3), edge=getControl(4), skinLock=getControl(5), bg=getControl(6);
  const levels=5 + Math.round(detail*7);
  const step=255/levels;
  for(let i=0;i<d.length;i+=4){
    let r=d[i],g=d[i+1],b=d[i+2];
    const lum=(r+g+b)/3;
    r=Math.round(r/step)*step; g=Math.round(g/step)*step; b=Math.round(b/step)*step;
    const ink=(lum<78*(.8+edge*.7)) ? (25*(1-activePreset.ink*.35)) : 0;
    d[i]=Math.min(255,r + glow*18 - ink + skinLock*2);
    d[i+1]=Math.min(255,g + glow*25 - ink + bg*3);
    d[i+2]=Math.min(255,b + glow*38 - ink + bg*10);
  }
  ctx.putImageData(img,0,0);
  ctx.globalCompositeOperation='screen';
  const grad=ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  grad.addColorStop(0,'rgba(0,235,255,.16)'); grad.addColorStop(.55,'rgba(105,30,255,.06)'); grad.addColorStop(1,'rgba(255,0,180,.22)');
  ctx.fillStyle=grad; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.globalCompositeOperation='source-over';
  $('#renderEmpty').hidden=true;
}

$('#renderBtn').addEventListener('click',render);
$('#compareHandle').addEventListener('click',render);
$('#resetBtn').addEventListener('click',()=>{document.querySelectorAll('#controls input').forEach((el,i)=>{el.value=controls[i][1]; document.querySelector('#c'+i+'o').value=controls[i][1];}); if(sourceBitmap) render();});
$('#generatePresetBtn').addEventListener('click',()=>{
  activePreset={id:'ai-'+Date.now(),name:'AI GENERATED '+Math.floor(Math.random()*900+100),hue:Math.floor(Math.random()*360),sat:1.1+Math.random()*.7,contrast:1.05+Math.random()*.55,ink:.6+Math.random()*.8};
  $('#activePresetLabel').textContent=`(${activePreset.name})`; if(sourceBitmap) render();
});
$('#compareBtn').addEventListener('click',()=>{sourceImage.style.opacity=sourceImage.style.opacity==='0'?'1':'0';});
$('#variationBtn').addEventListener('click',()=>{document.querySelector('#c0').value=Math.round(45+Math.random()*50);document.querySelector('#c0o').value=document.querySelector('#c0').value;if(sourceBitmap)render();});
$('#upscaleBtn').addEventListener('click',()=>alert('Upscale hook ready for local or remote AI engine.'));
$('#exportBtn').addEventListener('click',()=>{
  if(!sourceBitmap) return alert('Load an image first.');
  setStep(5);
  const format=$('#formatSelect').value==='JPEG'?'image/jpeg':'image/png';
  const ext=format==='image/jpeg'?'jpg':'png';
  const a=document.createElement('a'); a.download=`ai-radio-render-${Date.now()}.${ext}`; a.href=canvas.toDataURL(format,.94); a.click();
});
