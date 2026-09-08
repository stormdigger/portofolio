import { chapters, projects, toolbox, links } from './data.js';
import { World } from './world.js';
import { Universe } from './universe.js';

const $ = (selector) => document.querySelector(selector);
const pad = (n) => String(n).padStart(2, '0');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const icon = (id) => {
  const shapes = {
    facemeet: '<path d="M25 15Q50-3 75 15L80 48Q78 78 50 92Q22 78 20 48Z"/><path d="M24 37 39 32 50 40 62 32 77 37M23 52 40 50 50 40 60 50 78 52M30 72 50 64 70 72M40 50 42 62 58 62 60 50M38 76Q50 82 62 76"/><path d="M10 25V8H27M73 8H90V25M10 75V92H27M73 92H90V75"/>',
    doctorg: '<circle cx="50" cy="50" r="37"/><circle cx="50" cy="50" r="43" opacity=".3"/><path d="M0 50H18L22 43 27 57 32 35 38 69 44 18 51 83 57 32 63 60 69 41 75 54 80 50H100"/>',
    agristore: '<path d="m50 8 39 22-39 22L11 30Zm-39 42 39 22 39-22M11 70l39 22 39-22M50 52v40M11 30v40M89 30v40"/><path d="M50 40V21m0 12-12-8m12 3 12-10"/>',
    arovita: '<path d="M40 16h20v24h24v20H60v24H40V60H16V40h24Z"/><path d="M0 50h25l7-9 10 24 13-36 11 27 8-6h26"/><circle cx="50" cy="50" r="47" opacity=".3"/>',
    research: '<path d="M10 10v80h80M25 75V53h12v22M46 75V33h12v42M67 75V17h12v58"/><path d="m18 43 26-18 20 4L86 8"/><circle cx="44" cy="25" r="3"/><circle cx="64" cy="29" r="3"/>',
  };
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${shapes[id]}</svg>`;
};
const socialLinks = () => `<a href="${links.github}" target="_blank" rel="noreferrer">GITHUB ↗</a><a href="${links.linkedin}" target="_blank" rel="noreferrer">LINKEDIN ↗</a><a href="${links.leetcode}" target="_blank" rel="noreferrer">LEETCODE ↗</a><a href="${links.email}">EMAIL ↗</a>`;

function extra(chapter) {
  if(chapter.id==='arovita')return '<button class="send-request" id="send-request">SEND A REQUEST <span aria-hidden="true">↗</span></button><p id="request-status" class="request-status" aria-live="polite">Patient → API Gateway → Lambda → PostgreSQL</p>';
  if(chapter.id==='university') return '<p class="university-details">Data Structures & Algorithms · OOP · DBMS<br>Operating Systems · Computer Networks · System Design<br><span style="color:var(--amber)">Best Project of the Semester · Final Year CS Project</span></p>';
  if(chapter.special==='toolbox') return `<div class="tool-tabs" role="tablist" aria-label="Engineering tools">${toolbox.map((t,i)=>`<button role="tab" id="tool-${i}" data-tool="${i}" aria-selected="${i===0}" aria-controls="tool-panel" tabindex="${i===0?0:-1}">${pad(i+1)} ${t.title}</button>`).join('')}</div><div id="tool-panel" class="tool-panel" role="tabpanel" aria-labelledby="tool-0" tabindex="0"></div>`;
  if(chapter.special==='archive') return `<div class="archive-portals">${projects.map((p,i)=>`<button class="portal tone-${p.tone}" data-project="${p.id}" aria-label="Explore ${p.title}"><div class="door"><span class="portal-number">${pad(i+1)} / ${p.year}</span><span class="portal-symbol">${icon(p.id)}</span></div><span class="portal-category">${p.category}</span><span class="portal-title">${p.title}</span><span class="portal-link">EXPLORE PROJECT <span aria-hidden="true">↗</span></span></button>`).join('')}</div>`;
  if(chapter.special==='proof') return '<div class="proof-list"><div class="proof-item"><strong>AIR 53</strong><p>National Source-O-Code<br>Competitive Programming Contest</p></div><div class="proof-item"><strong>11th</strong><p>Celebal Anaverse<br>Competition</p></div><div class="proof-item"><strong>Best project</strong><p>Project of the Semester<br>Final Year CS Project</p></div><div class="proof-item"><strong>IEEE × 2</strong><p>Research publications<br>2024 & 2025</p></div></div><p class="certifications">ALSO ALONG THE WAY<br>Introduction to Cloud Computing · Coursera / React JS · Great Learning<br>Introduction to Programming Through C++ · NPTEL</p>';
  return '';
}

$('#story').innerHTML = chapters.map((ch,i)=>`<section id="${ch.id}" class="scene ${ch.special?`${ch.special}-scene`:''}" aria-labelledby="title-${ch.id}"><div class="scene-inner"><div class="scene-tag"><b>${ch.act}</b> ${pad(i+1)} / 12</div><div class="scene-copy ${ch.special==='ending'?'ending-memory':''}"><p class="eyebrow">${ch.eyebrow}</p><${i===0?'h1':'h2'} id="title-${ch.id}">${ch.title}</${i===0?'h1':'h2'}>${ch.text?`<p class="narration">${ch.text}</p>`:''}${ch.project?`<button class="scene-action" data-project="${ch.project}">EXPLORE THE SYSTEM <span aria-hidden="true">↗</span></button>`:''}${extra(ch)}${ch.cursor?`<p class="terminal">${ch.cursor}<span class="cursor">_</span></p>`:''}</div>${ch.side?`<p class="side-note">${ch.side}</p>`:''}${i===0?'<a class="first-scroll" href="#machine"><span class="scroll-line" aria-hidden="true"></span>SCROLL TO BEGIN THE STORY</a>':''}${ch.special==='ending'?`<div class="identity" aria-hidden="true" inert><p class="eyebrow">THE BOY WHO WANTED TO BUILD</p><h2>BALWINDER<span>SINGH</span></h2><p class="role">SOFTWARE DEVELOPMENT ENGINEER</p><p class="location">Punjab, India</p><div class="identity-links"><a href="#archive">WORK ↗</a>${socialLinks()}</div><p class="terminal">balwinder@portfolio:~$ what's next?<span class="cursor">_</span></p><a class="scene-action" href="#curiosity">BACK TO THE BEGINNING <span aria-hidden="true">↖</span></a></div>`:''}</div></section>`).join('');

$('#timeline').innerHTML = chapters.map((ch,i)=>`<a href="#${ch.id}" data-title="${pad(i+1)} ${ch.label.toUpperCase()}" aria-label="Chapter ${i+1}: ${ch.label}" aria-current="${i===0}"></a>`).join('');
$('#chapter-menu').innerHTML = chapters.map((ch,i)=>`<a href="#${ch.id}" aria-current="${i===0}"><span>${pad(i+1)}</span>${ch.label}</a>`).join('');

$('#quick-content').innerHTML = `<div class="quick-body"><div class="quick-heading"><div><h2 id="quick-title">Balwinder Singh</h2><p>SOFTWARE DEVELOPMENT ENGINEER<br>PUNJAB, INDIA</p></div><a class="resume-link" href="resume.html" target="_blank" rel="noopener">PRINTABLE RÉSUMÉ ↗</a></div><div class="quick-links">${socialLinks()}</div><section class="quick-section"><h3>CURRENT WORK</h3><div><h4>Software Development Engineer · Arovita Care</h4><p class="meta">NOVEMBER 2025 TO PRESENT · REMOTE</p><p>Engineering core modules of Arovita HMS, a multi-tenant Hospital Management System. AWS serverless architecture, role-based dashboards, OPD/IPD, appointments, EMR, prescriptions, billing, and telemedicine.</p><p>Cognito, JWT, and MFA authentication. Agora video and audio integration. Camera-based heart-rate monitoring. Collaboration with backend engineers, designers, and QA on API design, UX, and the SDLC.</p></div></section><section class="quick-section"><h3>SELECTED WORK</h3><div>${projects.map(p=>`<button class="quick-project" data-project="${p.id}"><b>${p.title} ↗</b><span>${p.year} · ${p.category}</span></button>`).join('')}</div></section><section class="quick-section"><h3>EDUCATION</h3><div><h4>B.E. Computer Science and Engineering</h4><p>Chandigarh University · August 2021 to May 2025<br>CGPA 8.0 / 10 · Best Project of the Semester, Final Year CS Project</p><p class="meta">DATA STRUCTURES & ALGORITHMS · OOP · DBMS · OPERATING SYSTEMS · COMPUTER NETWORKS · SYSTEM DESIGN</p></div></section><section class="quick-section"><h3>ENGINEERING</h3><div class="quick-skills">${toolbox.map(t=>`<p><b>${t.title}</b><span>${t.tools.join(' · ')}</span></p>`).join('')}</div></section><section class="quick-section"><h3>RESEARCH</h3><div><h4>Comparative Study of YOLOv8, Faster R-CNN & SSD in Traffic Sign Detection</h4><p class="meta">IEEE · 2025</p><p>Object detection, GPS feedback, monitoring, and autonomous-driving deployment context.</p><h4>Login Confirmation Mechanism for Meeting Platforms</h4><p class="meta">IEEE · 2024</p><p>Participant authentication, facial recognition, accuracy, latency, and robustness in real-world conditions.</p></div></section><section class="quick-section"><h3>ACHIEVEMENTS</h3><div><p>AIR 53 · National Source-O-Code Competitive Programming Contest<br>11th place · Celebal Anaverse Competition<br>Best Project of the Semester · Final Year CS Project</p></div></section><section class="quick-section"><h3>CERTIFICATIONS</h3><div><p>Introduction to Cloud Computing · Coursera<br>React JS · Great Learning<br>Introduction to Programming Through C++ · NPTEL</p></div></section></div>`;

let world;
try { world = new Universe($('#world'), motion.matches); document.body.classList.add('has-universe'); }
catch(error) {
  console.warn('3D unavailable; using the accessible illustrated story.', error);
  const replacement=document.createElement('canvas');replacement.id='world';$('#world').replaceWith(replacement);
  world=new World(replacement,motion.matches);document.body.classList.add('graphics-lost');
}
function selectTool(index) {
  world.tool = index;
  document.querySelectorAll('[data-tool]').forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
  const t=toolbox[index];$('#tool-panel').setAttribute('aria-labelledby',`tool-${index}`);
  $('#tool-panel').innerHTML=`<h3>${t.label}</h3><p>${t.text}</p><div class="tool-names">${t.tools.join(' / ')}</div>`;
  dirty=true;
}
let dirty = true;
selectTool(0);
document.querySelectorAll('[data-tool]').forEach(button=>{
  button.addEventListener('click',()=>selectTool(Number(button.dataset.tool)));
  button.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();let next=Number(button.dataset.tool);
    if(event.key==='ArrowRight')next=(next+1)%toolbox.length;
    if(event.key==='ArrowLeft')next=(next+toolbox.length-1)%toolbox.length;
    if(event.key==='Home')next=0;if(event.key==='End')next=toolbox.length-1;
    selectTool(next);$(`#tool-${next}`).focus();requestDraw();
  });
});

const detail=$('#detail-dialog'), quick=$('#quick-dialog');
let projectOrigin=null;
let returnToQuick=false;
function syncModal() {document.body.classList.toggle('modal-open',detail.open||quick.open);dirty=true;}
function openProject(id, origin) {
  const p=projects.find(project=>project.id===id);if(!p)return;
  projectOrigin=origin;returnToQuick=quick.open;
  $('#detail-back').textContent=returnToQuick?'← BACK TO QUICK VIEW':origin?.classList.contains('portal')?'← BACK TO ARCHIVE':'← CONTINUE STORY';
  $('#detail-content').innerHTML=`<article class="detail-body"><p class="detail-meta">${p.year} / ${p.category}</p><h2 id="detail-title">${p.title}</h2><p class="detail-meta">01 / THE QUESTION</p><p class="detail-question">${p.question}</p><div class="detail-flow" aria-label="System flow">${p.flow.map(f=>`<span>${f}</span>`).join('')}</div><div class="detail-columns"><section><h3>02 / THE SYSTEM</h3><p>${p.system}</p></section><section><h3>03 / THE ENGINEERING</h3><p>${p.engineering}</p></section></div><section class="detail-tools"><h3>04 / THE TOOLS</h3><p>${p.tools.join(' / ')}</p></section><p class="detail-note">${p.note}</p></article>`;
  world.setFocus?.(id);document.body.classList.add('project-entered');
  detail.showModal();detail.scrollTop=0;syncModal();requestDraw();
}
document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>openProject(button.dataset.project,button)));
$('#detail-back').addEventListener('click',()=>detail.close());
detail.addEventListener('close',()=>{world.setFocus?.(null);document.body.classList.remove('project-entered');syncModal();projectOrigin?.focus({preventScroll:true});});
$('#quick-view').addEventListener('click',()=>{closeChapters();quick.showModal();syncModal();});
$('#quick-close').addEventListener('click',()=>quick.close());
quick.addEventListener('close',()=>{syncModal();$('#quick-view').focus({preventScroll:true});});
for(const dialog of [detail,quick])dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});

const menu=$('#chapter-menu');
function closeChapters(){menu.hidden=true;$('#chapter-toggle').setAttribute('aria-expanded','false');}
$('#chapter-toggle').addEventListener('click',()=>{menu.hidden=!menu.hidden;$('#chapter-toggle').setAttribute('aria-expanded',String(!menu.hidden));});
document.addEventListener('click',e=>{if(!e.target.closest('#chapter-menu, #chapter-toggle'))closeChapters();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeChapters();$('#chapter-toggle').focus();}});
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',event=>{
  const target=document.getElementById(a.hash.slice(1));if(!target)return;
  event.preventDefault();closeChapters();history.replaceState(null,'',a.hash);
  target.scrollIntoView({behavior:motion.matches?'instant':'smooth'});
  if(a.classList.contains('skip-link')){const button=target.querySelector('button');button?.focus({preventScroll:true});}
}));

// Audio is synthesized locally, and only created following an explicit click.
let audioContext, audioGain, soundEnabled=false;
$('#sound').addEventListener('click',async()=>{
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx){$('#sound-label').textContent='SOUND UNAVAILABLE';return;}
  try {
    if(!audioContext){
      audioContext=new AudioCtx();audioGain=audioContext.createGain();audioGain.gain.value=0;audioGain.connect(audioContext.destination);
      const buffer=audioContext.createBuffer(1,audioContext.sampleRate*4,audioContext.sampleRate);const channel=buffer.getChannelData(0);let last=0;
      for(let i=0;i<channel.length;i++){last=(last+Math.random()*.04-.02)/1.02;channel[i]=last*.9;}
      const noise=audioContext.createBufferSource();noise.buffer=buffer;noise.loop=true;const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=400;noise.connect(filter);filter.connect(audioGain);noise.start();
      for(const hz of [55,82.41]){const oscillator=audioContext.createOscillator();oscillator.frequency.value=hz;const gain=audioContext.createGain();gain.gain.value=.018;oscillator.connect(gain);gain.connect(audioGain);oscillator.start();}
    }
    await audioContext.resume();soundEnabled=!soundEnabled;
    audioGain.gain.setTargetAtTime(soundEnabled?.32:0,audioContext.currentTime,.35);
    $('#sound').setAttribute('aria-pressed',String(soundEnabled));$('#sound-label').textContent=soundEnabled?'SOUND ON':'SOUND OFF';
  }catch{$('#sound-label').textContent='SOUND UNAVAILABLE';}
});

const scenes=[...document.querySelectorAll('.scene')];
const timeline=[...document.querySelectorAll('.timeline a')];
const chapterLinks=[...menu.querySelectorAll('a')];
let ranges=[],active=0,raf=0,lastDraw=0;
function measure(){ranges=scenes.map(scene=>({top:scene.offsetTop,height:scene.offsetHeight}));world.resize();if(!world.explodeTarget)$('#disassemble-label').textContent=innerWidth<761?'TAP TO PULL APART':'HOLD SPACE TO PULL APART';dirty=true;}
function updateStory(){
  const y=scrollY,h=innerHeight;
  let index=0;
  for(let i=0;i<ranges.length;i++)if(y+h*.38>=ranges[i].top)index=i;
  const range=ranges[index],chapter=chapters[index];
  const p=Math.max(0,Math.min(1,(y-range.top)/Math.max(1,range.height-h)));
  active=index;world.kind=chapter.world;world.progress=p;
  let spatialIndex=0;
  for(let i=0;i<ranges.length;i++)if(y>=ranges[i].top)spatialIndex=i;
  const spatialRange=ranges[spatialIndex];
  const local=(y-spatialRange.top)/spatialRange.height;
  const transition=Math.max(0,Math.min(1,(local-.48)/.52));
  const eased=transition*transition*(3-2*transition);
  const position=Math.min(11,spatialIndex+eased);
  world.setStory?.(position,local);
  document.body.dataset.chapter=chapter.id;
  $('#coordinate').textContent=(position*60).toFixed(3).padStart(7,'0');
  const words=['CURIOSITY','REPEAT','FOUNDATIONS','IDENTITY','UNDERSTAND','EVIDENCE','BEYOND','RESPONSIBILITY','POSSIBILITY','THE ARCHIVE','PROOF','STILL CURIOUS'];
  $('#world-word').textContent=words[index];
  $('#world-word').style.opacity=String(.17*(1-eased*.8));
  $('#world-word').style.transform=`translate3d(${-eased*60}px,0,0)`;
  for(let i=0;i<scenes.length;i++){
    const r=ranges[i],relative=r.top-y;
    const enter=Math.max(0,Math.min(1,(h*.85-relative)/(h*.55)));
    const leave=Math.max(0,Math.min(1,(r.top+r.height-y-h*.18)/(h*.7)));
    scenes[i].style.setProperty('--visibility',i===0?leave:Math.min(enter,leave));
    scenes[i].style.setProperty('--rise',`${motion.matches?0:Math.max(-20,Math.min(35,relative*.045))}px`);
  }
  const ending=chapter.id==='present'&&p>.46;
  $('#present').classList.toggle('revealed',ending);
  const identity=$('.identity');identity.inert=!ending;identity.setAttribute('aria-hidden',String(!ending));
  $('.ending-memory').setAttribute('aria-hidden',String(ending));
  const roomVisible=chapter.world==='room'&&!ending;
  $('#room').style.opacity=roomVisible?(index===0?Math.max(0,1-p*.5):.8):0;
  $('#room').style.transform=motion.matches?'none':`scale(${1+p*.17}) translate(${world.mouse.x*-3}px,${world.mouse.y*-2}px)`;
  if(ending)world.kind='proof';
  document.body.classList.toggle('at-ending',ending);
  $('#chapter-number').textContent=`${pad(index+1)} / 12`;
  $('#chapter-name').textContent=chapter.label;
  $('#progress-number').textContent=pad(Math.min(100,Math.round(y/Math.max(1,document.documentElement.scrollHeight-h)*100)));
  timeline.forEach((a,i)=>{a.setAttribute('aria-current',String(i===index));a.classList.toggle('visited',i<index);chapterLinks[i].setAttribute('aria-current',String(i===index));});
  const scrollCue=$('.first-scroll');scrollCue.style.opacity=String(Math.max(0,1-y/220));scrollCue.inert=y>220;
}
function tick(time){
  if(document.hidden){raf=0;return;}
  if(dirty){updateStory();dirty=false;}
  const interval=world.mobile?33:22;
  if(time-lastDraw>=interval&&(!quick.open||detail.open)){world.frame(time);lastDraw=time;}
  if(!motion.matches&&(!quick.open||detail.open))raf=requestAnimationFrame(tick);else raf=0;
}
function requestDraw(){dirty=true;if(!raf)raf=requestAnimationFrame(tick);}
addEventListener('scroll',requestDraw,{passive:true});
addEventListener('resize',()=>{measure();requestDraw();});
addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'||motion.matches)return;world.mouse.x=(event.clientX/innerWidth-.5)*2;world.mouse.y=(event.clientY/innerHeight-.5)*2;requestDraw();},{passive:true});
motion.addEventListener('change',()=>{world.reduced=motion.matches;requestDraw();});
document.addEventListener('visibilitychange',()=>{
  if(audioContext){if(document.hidden)audioContext.suspend();else if(soundEnabled)audioContext.resume();}
  if(!document.hidden)requestDraw();
});
for(const dialog of [detail,quick])dialog.addEventListener('close',requestDraw);
// A reversible exploded view works with keyboard, mouse, and touch.
const disassemble=$('#disassemble');
if(innerWidth<761)$('#disassemble-label').textContent='TAP TO PULL APART';
let requestTimer;
$('#send-request').addEventListener('click',()=>{
  clearInterval(requestTimer);world.requestStarted=performance.now();let step=0;
  const messages=['01 / PATIENT · REQUEST SENT','02 / API GATEWAY · ROUTING','03 / LAMBDA · PROCESSING','04 / POSTGRESQL · RESPONSE READY'];
  $('#request-status').textContent=messages[0];
  requestTimer=setInterval(()=>{step++;$('#request-status').textContent=messages[Math.min(step,3)];requestDraw();if(step>=3)clearInterval(requestTimer);},1100);requestDraw();
});
function setExploded(value){world.explodeTarget=value?1:0;disassemble.setAttribute('aria-pressed',String(value));document.body.classList.toggle('world-apart',value);$('#disassemble-label').textContent=value?'RELEASE TO REBUILD':innerWidth<761?'TAP TO PULL APART':'HOLD SPACE TO PULL APART';requestDraw();}
disassemble.addEventListener('click',()=>setExploded(!world.explodeTarget));
addEventListener('keydown',event=>{if(event.code==='Space'&&!event.repeat&&!event.target.closest('button,a,input,textarea,dialog,[role="tab"]')){event.preventDefault();setExploded(true);}});
addEventListener('keyup',event=>{if(event.code==='Space')setExploded(false);});
addEventListener('blur',()=>setExploded(false));
document.addEventListener('pointermove',event=>{
  const hit=world.pick?.(event.clientX,event.clientY);const blocked=event.target.closest('button,a,dialog');
  world.setHover?.(blocked?null:hit);
  const cursor=$('#portal-cursor');cursor.classList.toggle('visible',!!hit&&!blocked);cursor.style.left=`${event.clientX+18}px`;cursor.style.top=`${event.clientY+18}px`;document.body.classList.toggle('portal-hover',!!hit&&!blocked);
},{passive:true});
document.addEventListener('click',event=>{if(event.target.closest('button,a,dialog'))return;const hit=world.pick?.(event.clientX,event.clientY);if(hit)openProject(hit,document.querySelector(`.portal[data-project="${hit}"]`));});
document.querySelectorAll('.portal').forEach(button=>{
  for(const name of ['pointerenter','focus'])button.addEventListener(name,()=>{world.setHover?.(button.dataset.project);requestDraw();});
  for(const name of ['pointerleave','blur'])button.addEventListener(name,()=>{world.setHover?.(null);requestDraw();});
});
document.querySelectorAll('[data-tool]').forEach(tab=>tab.addEventListener('click',requestDraw));
measure();requestDraw();
document.fonts.ready.then(()=>{measure();requestDraw();});
// Re-measure after the browser restores an anchor or a previous scroll position.
addEventListener('pageshow',()=>{measure();requestDraw();});
if(location.hash)requestAnimationFrame(()=>{document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant'});requestDraw();});
