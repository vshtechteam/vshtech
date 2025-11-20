/* ================= MENU SYNC PATCH ================= */
function currentPageId(){ return (location.hash || '#metrics').replace('#',''); }

function syncMenu(){
  const id = currentPageId();
  // 1) Đồng bộ highlight item theo trang
  document.querySelectorAll('#menuSheet .menu-item[data-go]').forEach(a=>{
    const on = a.dataset.go === id;
    a.classList.toggle('active', on);
    a.setAttribute('aria-current', on ? 'page' : 'false');
  });
  // 2) Làm mới nhãn Auto-clear (nếu có)
  const autoItem = document.querySelector('#menuSheet .menu-item[data-auto-clear]');
  if(autoItem){
    const mark = isAuto() ? '✅' : '⬜️';
    autoItem.innerHTML = `
      <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>
      Auto-clear khi đổi trang ${mark}
    `;
  }
}

// Gọi khi đổi route (via hash)
window.addEventListener('hashchange', syncMenu);

// Gọi ngay lúc load lần đầu
syncMenu();

// Gọi ngay trước/đúng lúc mở menu HOME để luôn là trạng thái mới nhất
const _homeFab = document.getElementById('homeFab');
const _menuSheet = document.getElementById('menuSheet');
if(_homeFab){
  _homeFab.addEventListener('click', ()=>{
    // nếu đang kéo thì phần drag handler của bạn sẽ ngăn mở; vẫn safe khi gọi sync
    syncMenu();
  });
}

// Khi click một item menu chuyển trang: đã có handler đóng menu.
// Nhưng để chắc ăn, ta auto-sync sau 0ms (đợi hashchange)
document.querySelectorAll('#menuSheet .menu-item[data-go]').forEach(a=>{
  a.addEventListener('click', ()=>{
    setTimeout(syncMenu, 0);
  });
});
/* =============== END MENU SYNC PATCH =============== */
/* ================== DỌN CONSOLE — FULL FEATURE ================== */

/** 2.1. Xác định các vùng console hiện có (nếu bạn đổi id, sửa map ở đây) */
const CONSOLES = {
  metrics: '#logsMetrics',  // Console trong trang Chỉ số
  skill:   '#logsSkill',    // Console trong trang Skill Config
  file:    '#logsConsole',  // Console trong trang File
  all:     '#logsOnly'      // Console trang Console (tổng)
};

/** 2.2. Trợ giúp — lấy element theo selector an toàn */
const getEl = (sel) => document.querySelector(sel);

/** 2.3. Dọn một console (giữ lại 1 dòng “đã dọn” nếu silent=false) */
function clearConsoleBySel(sel, silent=false){
  const el = getEl(sel);
  if(!el) return;
  el.innerHTML = '';
  if(!silent){
    const note = document.createElement('div');
    note.className = 'line muted';
    note.innerHTML = 'Console đã được dọn. <span class="time">'+now()+'</span>';
    el.append(note);
  }
  el.scrollTop = el.scrollHeight;
}

/** 2.4. Dọn console đang hiển thị (theo trang active) */
function clearVisibleConsole(silent=false){
  const page = document.querySelector('.page.active')?.id || '';
  if(page==='page-metrics')  return clearConsoleBySel(CONSOLES.metrics, silent);
  if(page==='page-skills')   return clearConsoleBySel(CONSOLES.skill,   silent);
  if(page==='page-file')     return clearConsoleBySel(CONSOLES.file,    silent);
  if(page==='page-console')  return clearConsoleBySel(CONSOLES.all,     silent);
}

/** 2.5. Dọn tất cả console cùng lúc */
function clearAllConsoles(silent=false){
  [CONSOLES.metrics, CONSOLES.skill, CONSOLES.file, CONSOLES.all]
    .forEach(sel => clearConsoleBySel(sel, silent));
  ting();
}

/** 2.6. Tự chèn hàng “tool-row” + nút “Dọn console” vào MỌI console */
(function injectConsoleTools(){
  const containers = [
    getEl(CONSOLES.metrics)?.parentElement,
    getEl(CONSOLES.skill)?.parentElement,
    getEl(CONSOLES.file)?.parentElement,
    getEl(CONSOLES.all)?.parentElement
  ].filter(Boolean);

  containers.forEach(box=>{
    // Tránh chèn trùng
    if(box.querySelector('.tool-row')) return;
    const row = document.createElement('div');
    row.className = 'tool-row';
    row.innerHTML = `
      <button class="mini" data-clear="visible">
        <svg class="ico"><use href="#ic-cache"/></svg> Dọn console này
      </button>
      <button class="mini" data-clear="all">
        <svg class="ico"><use href="#ic-cache"/></svg> Dọn tất cả
      </button>
    `;
    box.insertBefore(row, box.querySelector('.log-body'));
  });

  // Gán sự kiện
  document.body.addEventListener('click', (e)=>{
    const btn = e.target.closest('.mini[data-clear]');
    if(!btn) return;
    const mode = btn.getAttribute('data-clear');
    if(mode==='all') clearAllConsoles();
    else clearVisibleConsole();
  });
})();

/** 2.7. Thêm “Dọn Console” vào menu HOME (tự động, không sửa HTML) */
(function addHomeMenuItem(){
  const list = document.querySelector('#menuSheet .menu-list');
  if(!list || list.querySelector('[data-clear-console]')) return;
  const a = document.createElement('a');
  a.href = '#';
  a.className = 'menu-item';
  a.setAttribute('data-clear-console','1');
  a.innerHTML = `
    <svg viewBox="0 0 24 24"><path d="M3 6h18v2H3v-2Zm2 4h14v8H5v-8Zm2 2v4h10v-4H7Z"/></svg>
    Dọn Console
  `;
  list.appendChild(a);

  a.addEventListener('click', (e)=>{
    e.preventDefault();
    clearAllConsoles();
    // đóng menu nếu đang mở
    const sheet = document.getElementById('menuSheet');
    if(sheet){ sheet.classList.remove('open'); sheet.setAttribute('aria-hidden','true'); }
  });
})();

/** 2.8. Phím tắt
 *  - Ctrl/⌘ + K : dọn console đang hiển thị
 *  - Shift + Ctrl/⌘ + K : dọn TẤT CẢ console
 */
window.addEventListener('keydown', (e)=>{
  const isMeta = e.ctrlKey || e.metaKey;
  if(!isMeta) return;
  if(e.key.toLowerCase()==='k'){
    e.preventDefault();
    if(e.shiftKey) clearAllConsoles();
    else clearVisibleConsole();
  }
});

/** 2.9. Tuỳ chọn “Auto-clear khi đổi trang” (bật/tắt, nhớ vào localStorage) */
const AUTO_KEY='fatx007:autoClearOnRoute';
function isAuto(){ try{return localStorage.getItem(AUTO_KEY)==='1';}catch{return false;} }
function setAuto(v){ try{ localStorage.setItem(AUTO_KEY, v?'1':'0'); }catch{} }

/* Thêm công tắc vào menu HOME (tự động) */
(function addAutoToggle(){
  const list = document.querySelector('#menuSheet .menu-list');
  if(!list || list.querySelector('[data-auto-clear]')) return;
  const a = document.createElement('a');
  a.href='#'; a.className='menu-item'; a.setAttribute('data-auto-clear','1');
  const chk = isAuto()?'✅':'⬜️';
  a.innerHTML = `<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg> Auto-clear khi đổi trang ${chk}`;
  list.appendChild(a);
  a.addEventListener('click',(e)=>{
    e.preventDefault();
    const v=!isAuto(); setAuto(v);
    a.innerHTML = `<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg> Auto-clear khi đổi trang ${v?'✅':'⬜️'}`;
  });
})();

/* Kích hoạt auto-clear khi router đổi trang */
window.addEventListener('hashchange', ()=>{
  if(isAuto()) clearVisibleConsole(true); // silent=true: không in dòng “đã dọn”
});

/* ================== HẾT PHẦN DỌN CONSOLE ================== */
/* ============== Utils & Sound ============== */
const $=s=>document.querySelector(s);
const $$=(s,ctx=document)=>Array.from(ctx.querySelectorAll(s));
const now=()=>new Date().toLocaleTimeString('vi-VN',{hour12:false});
const rnd=(a,b)=>Math.random()*(b-a)+a;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let AC; function ting(){ try{ AC=AC||new (window.AudioContext||window.webkitAudioContext)(); const o=AC.createOscillator(), g=AC.createGain(); o.type='sine'; o.frequency.value=1250; const t=AC.currentTime; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.22,t+0.02); g.gain.exponentialRampToValueAtTime(0.001,t+0.16); o.connect(g).connect(AC.destination); o.start(t); o.stop(t+0.17);}catch{} }

/* ============== HOME drag + menu ============== */
const fab=$('#homeFab'), sheet=$('#menuSheet');
fab.addEventListener('click', (e)=>{
  // nếu đang kéo thì không mở
  if(fab.dataset.dragging==='1'){ fab.dataset.dragging='0'; return; }
  sheet.classList.toggle('open'); sheet.setAttribute('aria-hidden', String(!sheet.classList.contains('open'))); ting();
});
sheet.addEventListener('click', e=>{ if(e.target===sheet){ sheet.classList.remove('open'); sheet.setAttribute('aria-hidden','true'); ting(); }});
$$('.menu-item',sheet).forEach(a=>{
  a.addEventListener('click', ev=>{
    ev.preventDefault(); const id=a.dataset.go; location.hash=id; sheet.classList.remove('open'); sheet.setAttribute('aria-hidden','true'); ting();
  });
});
// Drag (pointer events) + snap within viewport + remember
(function enableDrag(){
  let dx=0, dy=0, dragging=false;
  const restore=()=>{ try{ const p=JSON.parse(localStorage.getItem('fabpos')||'null'); if(p){ fab.style.left=p.x+'px'; fab.style.top=p.y+'px'; } }catch{} };
  restore();
  fab.addEventListener('pointerdown', (e)=>{ dragging=true; dx=e.clientX - fab.offsetLeft; dy=e.clientY - fab.offsetTop; fab.setPointerCapture(e.pointerId); });
  fab.addEventListener('pointermove', (e)=>{ if(!dragging) return; fab.dataset.dragging='1';
    const vw=window.innerWidth, vh=window.innerHeight; let x=e.clientX-dx, y=e.clientY-dy;
    x=clamp(x, 8, vw-60); y=clamp(y, 8, vh-60); fab.style.left=x+'px'; fab.style.top=y+'px';
  });
  fab.addEventListener('pointerup', (e)=>{ if(!dragging) return; dragging=false; const x=fab.offsetLeft, y=fab.offsetTop; localStorage.setItem('fabpos', JSON.stringify({x,y})); setTimeout(()=>fab.dataset.dragging='0',50); });
})();

/* ============== Router ============== */
function showPage(id){ $$('.page').forEach(p=>p.classList.remove('active')); $(`#page-${id}`)?.classList.add('active'); }
window.addEventListener('hashchange',()=>{ const id=(location.hash||'#metrics').replace('#',''); showPage(id); ting(); });
if(!location.hash) location.hash='#metrics'; showPage((location.hash||'#metrics').replace('#',''));

/* ============== Shared Consoles ============== */
const logMetrics=$('#logsMetrics'), logSkill=$('#logsSkill'), logConsole=$('#logsConsole'), logOnly=$('#logsOnly');
function appendToAll(el){ // clone to all console panes
  if(logMetrics){ logMetrics.append(el.cloneNode(true)); logMetrics.scrollTop=logMetrics.scrollHeight; }
  if(logSkill){ logSkill.append(el.cloneNode(true)); logSkill.scrollTop=logSkill.scrollHeight; }
  if(logConsole){ logConsole.append(el.cloneNode(true)); logConsole.scrollTop=logConsole.scrollHeight; }
  if(logOnly){ logOnly.append(el); logOnly.scrollTop=logOnly.scrollHeight; }
}
function codeLine(html, cls='info'){ const el=document.createElement('div'); el.className='line code '+cls; el.innerHTML=html+` <span class="time">${now()}</span>`; return el; }
function textLine(txt, cls='info'){ const el=document.createElement('div'); el.className='line '+cls; el.innerHTML=txt+` <span class="time">${now()}</span>`; return el; }
// Mirror console.* into panes
const _c={log:console.log,warn:console.warn,error:console.error,info:console.info};
console.log=(...a)=>appendToAll(textLine(a.join(' '),'ok'));
console.warn=(...a)=>appendToAll(textLine(a.join(' '),'warn'));
console.error=(...a)=>appendToAll(textLine(a.join(' '),'danger'));
console.info=(...a)=>appendToAll(textLine(a.join(' '),'info'));

/* ============== C++ code stream generator ============== */
const cppKw=['#include','using','namespace','auto','constexpr','std::vector','std::string','inline','template','typename','struct','class','return','for','if','else'];
const cppFns=['optimize','applyProfile','boost','stabilize','calibrate','activate','patch','commit','flush','measure','warmup','finalize'];
function randItem(a){ return a[Math.floor(Math.random()*a.length)]; }
function cppLine(name, p){
  const k1=randItem(cppKw), k2=randItem(cppKw), fn=randItem(cppFns);
  const num=(Math.floor(Math.random()*997)+3).toString();
  return codeLine(
    `<span class="kw">${k1}</span> <span class="str">&lt;fatx007/${name}.hpp&gt;</span>; `
    + `<span class="kw">${k2}</span> <span class="fn">${fn}</span>(<span class="num">${num}</span>); `
    + `<span class="cm">// ${name} ${p}%</span>`,
    p<100?'info':'ok'
  );
}

/* ============== Metrics + chart + actions (0→100%) ============== */
const metrics={cpu:45+rnd(-8,8), ram:48+rnd(-6,6), io:24+rnd(-6,6), ping:60+rnd(-20,15)};
function renderStats(){ $('#cpuVal').textContent=Math.round(metrics.cpu)+'%'; $('#ramVal').textContent=Math.round(metrics.ram)+'%'; $('#ioVal').textContent=Math.round(metrics.io)+'%'; $('#pingVal').textContent=Math.max(0,Math.round(metrics.ping)); }
renderStats(); try{ if(performance?.memory?.jsHeapSizeLimit){ $('#ramTag').textContent='Heap '+(performance.memory.jsHeapSizeLimit/1024**3).toFixed(1)+'GB'; } }catch{}
let driftAmp={cpu:2.0, ram:1.0}, jitter=1.0, timers=new Set();
timers.add(setInterval(()=>{ metrics.cpu=clamp(metrics.cpu+rnd(-driftAmp.cpu,driftAmp.cpu)*jitter,3,98); metrics.ram=clamp(metrics.ram+rnd(-driftAmp.ram,driftAmp.ram)*jitter,8,98); metrics.io=clamp(metrics.io+rnd(-3,3)*jitter,0,98); metrics.ping=clamp(metrics.ping+rnd(-3,3)*jitter,5,200); renderStats(); },1000));
/* chart */
const cvs=$('#chart'), ctx=cvs.getContext('2d'), maxPts=120, S={cpu:[],ram:[]};
function size(){ const r=cvs.getBoundingClientRect(); cvs.width=Math.floor(r.width*devicePixelRatio); cvs.height=Math.floor(200*devicePixelRatio); draw(); }
addEventListener('resize', size, {passive:true});
function draw(){ const W=cvs.width,H=cvs.height,p=16*devicePixelRatio; ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,255,255,.07)'; ctx.lineWidth=1; for(let i=0;i<=5;i++){const y=p+(H-2*p)*i/5; ctx.beginPath(); ctx.moveTo(p,y); ctx.lineTo(W-p,y); ctx.stroke();}
  ctx.strokeStyle='rgba(255,255,255,.55)'; ctx.lineWidth=2*devicePixelRatio; ctx.beginPath();
  for(let i=0;i<S.ram.length;i++){const x=p+(W-2*p)*(i/(maxPts-1)), y=p+(H-2*p)*(1-S.ram[i]/100); if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y);} ctx.stroke();
  ctx.strokeStyle='#ff6666'; ctx.lineWidth=2*devicePixelRatio; ctx.beginPath();
  for(let i=0;i<S.cpu.length;i++){const x=p+(W-2*p)*(i/(maxPts-1)), y=p+(H-2*p)*(1-S.cpu[i]/100); if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y);} ctx.stroke(); }
timers.add(setInterval(()=>{S.cpu.push(clamp(metrics.cpu,0,100)); S.ram.push(clamp(metrics.ram,0,100)); if(S.cpu.length>maxPts){S.cpu.shift(); S.ram.shift();} draw();},1000));
size();

/* actions progress bar + code */
const dot=$('#stateDot'), stateText=$('#stateText'), bar=$('#bar'), pct=$('#pct'); let working=false;
function setState(kind='ok', text='Xong'){ dot.className='dot '+(kind==='ok'?'ok':kind==='warn'?'warn':'err'); stateText.textContent=text; }
async function runTask(name, ms=2000){
  if(working) return; working=true; ting(); setState('warn', `Đang chạy: ${name}…`);
  appendToAll(codeLine(`<span class="kw">task</span>.<span class="fn">start</span>(<span class="str">"${name}"</span>)`, 'info'));
  const t0=performance.now();
  return new Promise(res=>{ (function step(){ const p=clamp((performance.now()-t0)/ms*100,0,100);
    bar.style.width=p.toFixed(1)+'%'; pct.textContent=Math.round(p)+'%';
    if(Math.round(p)%10===0) appendToAll(cppLine(name.replace(/\s+/g,'_').toLowerCase(), Math.round(p)));
    if(p>=100){ appendToAll(codeLine(`<span class="kw">task</span>.<span class="fn">end</span>(<span class="str">"${name}"</span>, <span class="kw">OK</span>)`, 'ok')); setTimeout(()=>{setState('ok', `${name} hoàn tất`); working=false; res();},120);}
    else requestAnimationFrame(step);
  })(); });
}
/* bind actions */
const mem={alloc:[]};
async function actRam(){ await runTask('Dọn RAM', 2000); const n=Math.floor(rnd(4,9)); for(let i=0;i<n;i++){mem.alloc.push(new Uint8Array(1024*1024));} await sleep(140); mem.alloc=[]; const freed=Math.round(rnd(6,14)); metrics.ram=clamp(metrics.ram-freed,5,98); renderStats(); console.log(`Giải phóng ~${freed}% heap tạm.`); }
async function actFps(){ await runTask('Tối ưu FPS', 2400); metrics.cpu=clamp(metrics.cpu-rnd(2,6),3,98); renderStats(); console.log('Game profile: ưu tiên canvas, giảm tác vụ nền.'); }
async function actNet(){ await runTask('Tối ưu mạng', 2300); const reduce=Math.round(rnd(8,22)); metrics.ping=clamp(metrics.ping-reduce,5,200); renderStats(); console.log(`Độ trễ ước giảm ~${reduce}ms.`); }
async function actKill(){ await runTask('Diệt tiến trình nền', 1600); let c=0; for(const id of timers){clearInterval(id); c++;} timers.clear();
  timers.add(setInterval(()=>{ metrics.cpu=clamp(metrics.cpu+rnd(-driftAmp.cpu,driftAmp.cpu)*jitter,3,98); metrics.ram=clamp(metrics.ram+rnd(-driftAmp.ram,driftAmp.ram)*jitter,8,98); metrics.io=clamp(metrics.io+rnd(-3,3)*jitter,0,98); metrics.ping=clamp(metrics.ping+rnd(-3,3)*jitter,5,200); renderStats(); },1000));
  timers.add(setInterval(()=>{ S.cpu.push(clamp(metrics.cpu,0,100)); S.ram.push(clamp(metrics.ram,0,100)); if(S.cpu.length>maxPts){S.cpu.shift();S.ram.shift();} draw();},1000));
  console.log(`Dừng ${c} interval; khởi động monitor nhẹ.`); }
async function actBench(){ await runTask('Benchmark CPU', 2000); const t0=performance.now(); let acc=0; for(let i=0;i<2_000_000;i++){acc+=Math.sqrt(i%97)*Math.sin(i%13);} const took=performance.now()-t0; const score=Math.round(2_000_000*1000/took); console.log(`Benchmark: ${took.toFixed(1)} ms • Score: ${score.toLocaleString()}`); metrics.cpu=clamp(metrics.cpu+rnd(3,8),5,98); renderStats(); }
$('#btnRam').onclick=actRam; $('#btnFps').onclick=actFps; $('#btnNet').onclick=actNet; $('#btnKill').onclick=actKill; $('#btnBench').onclick=actBench;

/* ============== SKILL CONFIG (tiles with 10s C++ stream) ============== */
const skills = [
  {key:'screen_buff', label:'Screen Touch [Nhạy Màn]'},
  {key:'reduce_aim_stickness',   label:'Reduce Stickness [Nhẹ Tâm]'},
  {key:'sensitivity', label:'Sensitivity [NHẠY]'},
  {key:'anti_shake',  label:'Fix Recoil [Fix Rung]'},
  {key:'aim_lock',    label:'AimLock [AIMLOCK]'},
];
const skillGrid=$('#skillGrid');
skills.forEach(s=>{
  const tile=document.createElement('div'); tile.className='skill-tile'; tile.dataset.key=s.key;
  tile.innerHTML=`<div class="tile-progress"></div><h4>${s.label}</h4><div class="sub">Nhấn để kích hoạt / tắt</div>`;
  skillGrid.append(tile);
});
const skillState={}; // key -> active
function runSkillCpp(nameVi, key){
  ting();
  const tile = document.querySelector(`.skill-tile[data-key="${key}"]`);
  const bar = tile.querySelector('.tile-progress');
  tile.classList.add('active'); bar.style.width='0%'; skillState[key]=true;

  const start=performance.now(), D=10000; // 10s
  appendToAll(textLine(`Bắt đầu chạy ${nameVi}…`,'info'));
  (function step(){
    const p=clamp((performance.now()-start)/D*100,0,100);
    bar.style.width=p.toFixed(1)+'%';
    if(Math.round(p)%10===0){ appendToAll(cppLine(key, Math.round(p))); }
    if(p<100 && skillState[key]) requestAnimationFrame(step); else {
      if(skillState[key]){ // kết thúc thành công
        appendToAll(codeLine(`<span class="kw">result</span> <span class="fn">${key}</span> = <span class="kw">SUCCESS</span>;`, 'ok'));
        appendToAll(textLine(`${nameVi.toUpperCase()} ĐÃ ĐƯỢC CHẠY THÀNH CÔNG`,'ok'));
      } else {
        appendToAll(textLine(`ĐÃ TẮT ${nameVi}.`,'warn'));
      }
      bar.style.width= skillState[key] ? '100%' : '0%';
    }
  })();
}
skillGrid.addEventListener('click', e=>{
  const tile=e.target.closest('.skill-tile'); if(!tile) return;
  const key=tile.dataset.key;
  const label=skills.find(x=>x.key===key)?.label||key;
  const nameVi = label.match(/\[(.+)\]/)?.[1] || label;
  if(!skillState[key]){ runSkillCpp(nameVi, key); }
  else{ // tắt
    skillState[key]=false; tile.classList.remove('active'); tile.querySelector('.tile-progress').style.width='0%';
    appendToAll(textLine(`Tắt ${nameVi}.`,'warn')); ting();
  }
  // Ảnh hưởng giả lập
  if(key==='dpi_150'){ document.documentElement.style.setProperty('--ui-scale', skillState[key]?'1.5':'1'); }
  if(key==='reduce_aim_stickness'){ driftAmp.cpu = skillState[key]?1.0:2.0; driftAmp.ram=skillState[key]?0.8:1.0; }
  if(key==='anti_shake'){ jitter = skillState[key]?0.6:1.0; }
  if(key==='screen_buff'){ document.body.style.filter = skillState[key]?'contrast(1.06) saturate(1.08) brightness(1.02)':'none'; }
});

/* ============== FILE (.cfg / .ini / .so only) ============== */
let picked=null; const allowed=['cfg','ini','so'];
function validExt(name){const ext=(name.split('.').pop()||'').toLowerCase(); return allowed.includes(ext);}
$('#fileInput').addEventListener('change',e=>{
  const f=e.target.files?.[0]||null;
  if(!f){ picked=null; $('#fileName').textContent='Tên: —'; $('#fileInfo').textContent='Kích thước/Loại: —'; return; }
  if(!validExt(f.name)){
    ting(); appendToAll(textLine('File không hợp lệ. Chỉ chấp nhận .cfg, .ini, .so','danger'));
    e.target.value=''; picked=null; $('#fileName').textContent='Tên: —'; $('#fileInfo').textContent='Kích thước/Loại: —'; return;
  }
  picked=f; $('#fileName').textContent='Tên: '+picked.name; $('#fileInfo').textContent='Kích thước/Loại: '+picked.size+' B / '+(picked.type||'unknown'); appendToAll(textLine('Chọn tệp: '+picked.name,'info')); ting();
});
$('#btnActivate').addEventListener('click', async ()=>{
  if(!picked){ ting(); appendToAll(textLine('Chưa chọn đúng tệp (.cfg / .ini / .so)','warn')); return; }
  // dùng progress của trang Chỉ số + log C++
  await runTask('Kích hoạt tệp', 1800);
  appendToAll(cppLine('activate_file', 100));
  appendToAll(textLine('Tệp đang chạy (mô phỏng): '+picked.name,'ok'));
});
/*! Fatx007 SkillEngine v2 – all-in-one JS (paste & go)
 *  Features: Screen Buff, DPI scale, Calm Mode, Sensitivity, Anti-Shake, Aim Lock, Drag Lock
 *  Auto-binds tiles: .skill-tile[data-key] with keys:
 *  screen_buff | dpi_150 | reduce_aim_stickness | sensitivity | anti_shake | aim_lock | drag_lock
 *  Console targets (nếu có): #logsSkill, #logsMetrics, #logsConsole, #logsOnly
 *  Author: Fatx007 Booster
 */
(function (global) {
  'use strict';

  /* ================= Utils ================= */
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const nowStr = () => new Date().toLocaleTimeString('vi-VN', { hour12: false });
  const dist2 = (x1, y1, x2, y2) => { const dx = x2 - x1, dy = y2 - y1; return dx*dx + dy*dy; };
  const rndItem = a => a[Math.floor(Math.random() * a.length)];

  /* ================= Ting ================= */
  let AC;
  function ting() {
    try {
      AC = AC || new (global.AudioContext || global.webkitAudioContext)();
      const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
      o.type = 'sine'; o.frequency.value = 1250;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.22, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t + 0.17);
    } catch {}
  }

  /* ================= Logger (HTML consoles if exist) ================= */
  const LOG_SEL = ['#logsSkill', '#logsMetrics', '#logsConsole', '#logsOnly'];
  function appendHtmlToConsoles(html, cls = 'info') {
    const line = document.createElement('div');
    line.className = 'line ' + (html.includes('<span') ? 'code ' + cls : cls);
    line.innerHTML = html + ` <span class="time">${nowStr()}</span>`;
    let appended = false;
    LOG_SEL.forEach(sel => {
      const el = $(sel);
      if (el) {
        el.append(line.cloneNode(true));
        el.scrollTop = el.scrollHeight;
        appended = true;
      }
    });
    if (!appended) {
      // fallback terminal
      const text = line.textContent.replace(/\s+/g, ' ').trim();
      if (cls === 'danger') console.error(text);
      else if (cls === 'warn') console.warn(text);
      else if (cls === 'ok' || cls === 'success') console.log(text);
      else console.info(text);
    }
  }

  // C++-ish pretty line
  const CPP_KW = ['#include', 'using', 'namespace', 'auto', 'constexpr', 'struct', 'class', 'return', 'for', 'if', 'else', 'template'];
  const CPP_FN = ['optimize', 'applyProfile', 'boost', 'stabilize', 'calibrate', 'activate', 'patch', 'commit', 'flush', 'measure', 'warmup', 'finalize'];
  function cppLine(name, p) {
    const k1 = rndItem(CPP_KW), k2 = rndItem(CPP_KW), fn = rndItem(CPP_FN);
    const num = (Math.floor(Math.random() * 997) + 3).toString();
    appendHtmlToConsoles(
      `<span class="kw">${k1}</span> <span class="str">&lt;Fatx007/${name}.hpp&gt;</span>; `
      + `<span class="kw">${k2}</span> <span class="fn">${fn}</span>(<span class="num">${num}</span>); `
      + `<span class="cm">// ${name} ${p}%</span>`,
      p < 100 ? 'info' : 'ok'
    );
  }

  /* ================= Style helper ================= */
  function upsertStyle(id, css) {
    let s = document.getElementById(id);
    if (!s) { s = document.createElement('style'); s.id = id; document.head.appendChild(s); }
    s.textContent = css;
  }

  /* ================= Virtual Pointer (Sensitivity / Anti-Shake / Aim / Drag) ================= */
  const VP = {
    x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2,
    emaAlpha: 1.0, gain: 1.0,
    prevX: null, prevY: null
  };
  const AIM = { enabled: false, radius: 90, strength: 0.25 }; // px, 0..1
  const DRAG = { enabled: false, active: false, el: null, ox: 0, oy: 0, vx: 0, vy: 0, friction: 0.18 };

  function vpPointerMove(e) {
    const dx = (typeof e.movementX === 'number') ? e.movementX : (VP.prevX == null ? 0 : e.clientX - VP.prevX);
    const dy = (typeof e.movementY === 'number') ? e.movementY : (VP.prevY == null ? 0 : e.clientY - VP.prevY);
    VP.prevX = e.clientX; VP.prevY = e.clientY;
    VP.tx += (dx || 0) * VP.gain;
    VP.ty += (dy || 0) * VP.gain;
    VP.tx = clamp(VP.tx, 0, innerWidth);
    VP.ty = clamp(VP.ty, 0, innerHeight);
  }
  function vpPointerDown(e) {
    if (!DRAG.enabled) return;
    const t = e.target.closest('[data-draggable]');
    if (!t) return;
    DRAG.active = true; DRAG.el = t;
    const r = t.getBoundingClientRect();
    DRAG.ox = VP.x - (r.left + r.width / 2);
    DRAG.oy = VP.y - (r.top + r.height / 2);
    t.setPointerCapture?.(e.pointerId);
  }
  function vpPointerUp() {
    DRAG.active = false; DRAG.el = null; DRAG.vx = DRAG.vy = 0;
  }
  function vpLoop() {
    // EMA anti-shake
    const a = clamp(VP.emaAlpha, 0.05, 1.0);
    VP.x = a * VP.tx + (1 - a) * VP.x;
    VP.y = a * VP.ty + (1 - a) * VP.y;

    // Aim lock
    if (AIM.enabled) {
      let best = null, bestD2 = Infinity;
      $$('[data-aim-target]').forEach(el => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const d2 = dist2(VP.x, VP.y, cx, cy);
        if (d2 < bestD2) { bestD2 = d2; best = { cx, cy }; }
      });
      if (best && bestD2 <= AIM.radius * AIM.radius) {
        VP.x = lerp(VP.x, best.cx, AIM.strength);
        VP.y = lerp(VP.y, best.cy, AIM.strength);
      }
    }

    // Drag lock
    if (DRAG.enabled && DRAG.active && DRAG.el) {
      const el = DRAG.el;
      const tx = VP.x - DRAG.ox, ty = VP.y - DRAG.oy;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      DRAG.vx = (tx - cx) * DRAG.friction;
      DRAG.vy = (ty - cy) * DRAG.friction;
      const prev = el.__fatx007_transform || { x: 0, y: 0 };
      const nx = prev.x + DRAG.vx, ny = prev.y + DRAG.vy;
      el.style.transform = `translate(${nx}px, ${ny}px)`;
      el.style.willChange = 'transform';
      el.__fatx007_transform = { x: nx, y: ny };
    }

    requestAnimationFrame(vpLoop);
  }

  /* attach input listeners once */
  (function initVP() {
    window.addEventListener('pointermove', vpPointerMove, { passive: true });
    window.addEventListener('pointerdown', vpPointerDown, { passive: true });
    window.addEventListener('pointerup', vpPointerUp, { passive: true });
    requestAnimationFrame(vpLoop);
  })();

  /* ================= Skills impl ================= */
  const STYLE_ID = 'fatx007-skill-style';
  const Skills = {
    screen_buff(on, { profile = 'clear', intensity = 70 } = {}) {
      if (!on) { upsertStyle(STYLE_ID + '-buff', `html{filter:none !important}`); return; }
      const mul = profile === 'ultra' ? 1.3 : profile === 'clear' ? 1.15 : 1.06;
      const i = clamp(intensity, 0, 100) / 100;
      const contrast = (1 + 0.06 * i * mul).toFixed(3);
      const saturate = (1 + 0.08 * i).toFixed(3);
      const bright = (1 + 0.02 * i).toFixed(3);
      upsertStyle(STYLE_ID + '-buff',
        `html{filter:contrast(${contrast}) saturate(${saturate}) brightness(${bright}) !important}`);
    },
    dpi_150(on, { scale = 1.5 } = {}) {
      document.documentElement.style.setProperty('--ui-scale', on ? String(scale) : '1');
    },
    reduce_aim_stickness(on, { mode = 'balance' } = {}) {
      // Hook drift/jitter nếu app có
      const aggr = mode === 'aggr' || mode === 'aggressive';
      try {
        if (global.driftAmp) { driftAmp.cpu = on ? (aggr ? 0.6 : 1.0) : 2.0; driftAmp.ram = on ? (aggr ? 0.4 : 0.8) : 1.0; }
        if (typeof global.jitter !== 'undefined') global.jitter = on ? (aggr ? 0.5 : 0.8) : 1.0;
      } catch {}
    },
    sensitivity(on, { gain = 1.35 } = {}) {
      VP.gain = on ? gain : 1.0;
    },
    anti_shake(on, { strength = 0.6 } = {}) {
      VP.emaAlpha = on ? clamp(1 - strength, 0.05, 0.95) : 1.0;
      try { if (typeof global.jitter !== 'undefined') global.jitter = on ? Math.max(0.3, 1 - strength) : 1.0; } catch {}
    },
    aim_lock(on, { radius = 90, strength = 0.28 } = {}) {
      AIM.enabled = !!on; AIM.radius = radius; AIM.strength = clamp(strength, 0.05, 0.5);
    },
    drag_lock(on, { friction = 0.18 } = {}) {
      DRAG.enabled = !!on; DRAG.friction = clamp(friction, 0.06, 0.35);
      if (!on) { DRAG.active = false; DRAG.el = null; DRAG.vx = DRAG.vy = 0; }
    }
  };

  /* ================= Public API ================= */
  const API = {
    /** Bật/tắt skill */
    set(name, on, opts) { if (Skills[name]) Skills[name](!!on, opts || {}); else console.warn('Unknown skill:', name); },
    enable(name, opts) { API.set(name, true, opts); },
    disable(name) { API.set(name, false); },
    /** Chạy 10s progress + C++ log + đổi UI tile (auto nếu có .skill-tile .tile-progress) */
    runWithProgress(key, on) {
      const tile = document.querySelector(`.skill-tile[data-key="${key}"]`);
      const bar = tile ? tile.querySelector('.tile-progress') : null;
      const vi = ({
        screen_buff: 'BUFF MÀN',
        dpi_150: 'DPI X150',
        reduce_aim_stickness: 'NHẸ TÂM',
        sensitivity: 'NHẠY',
        anti_shake: 'FIX RUNG',
        aim_lock: 'AIMLOCK',
        drag_lock: 'DARGLOCK'
      })[key] || key.toUpperCase();

      // Toggle effect
      API.set(key, on);
      if (!tile) { // không có UI tile — log & thoát
        appendHtmlToConsoles(on ? `Bật ${vi}` : `Tắt ${vi}`, on ? 'ok' : 'warn');
        return;
      }

      ting();
      tile.classList.toggle('active', !!on);
      if (!on) { if (bar) bar.style.width = '0%'; appendHtmlToConsoles(`ĐÃ TẮT ${vi}.`, 'warn'); return; }

      // 10s progress
      const start = performance.now(), D = 10000;
      if (bar) bar.style.width = '0%';
      appendHtmlToConsoles(`Bắt đầu chạy ${vi}…`, 'info');

      (function step() {
        const p = clamp((performance.now() - start) / D * 100, 0, 100);
        if (bar) bar.style.width = p.toFixed(1) + '%';
        if (Math.round(p) % 10 === 0) cppLine(key, Math.round(p));
        if (p < 100 && tile.classList.contains('active')) requestAnimationFrame(step);
        else {
          if (tile.classList.contains('active')) {
            cppLine(key, 100);
            appendHtmlToConsoles(`${vi} ĐÃ ĐƯỢC CHẠY THÀNH CÔNG`, 'ok');
            if (bar) bar.style.width = '100%';
          } else {
            appendHtmlToConsoles(`ĐÃ TẮT ${vi}.`, 'warn');
            if (bar) bar.style.width = '0%';
          }
        }
      })();
    },
    /** Gắn sự kiện click cho .skill-tile[data-key] (auto) */
    bindTiles(containerSel = '#skillGrid') {
      const root = $(containerSel) || document;
      root.addEventListener('click', (e) => {
        const tile = e.target.closest('.skill-tile[data-key]');
        if (!tile) return;
        const key = tile.dataset.key;
        const newOn = !tile.classList.contains('active');
        API.runWithProgress(key, newOn);
      });
    }
  };

  // Expose
  global.SkillEngine = API;

  /* ================= Auto-boot ================= */
  function boot() {
    // inject minimal CSS for tile-progress (nếu thiếu)
    upsertStyle('fatx007-skill-autocss', `
      .skill-tile{position:relative}
      .skill-tile .tile-progress{position:absolute;left:0;top:0;height:3px;background:linear-gradient(90deg,#6ee7b7,#6ea8ff);width:0%;border-top-left-radius:12px;border-top-right-radius:12px}
      .skill-tile.active{background:linear-gradient(180deg,rgba(34,197,94,.14),rgba(34,197,94,.04)),#0a0e14; border-color:#16a34a66}
    `);
    // Auto-bind nếu có grid & tiles
    if ($('.skill-tile[data-key]')) API.bindTiles();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})(window);

/* Tắt vĩnh viễn auto-clear */
try{
  localStorage.setItem('fatx007:autoClearOnRoute','0');   // hoặc removeItem cũng được
  // Xóa item đã chèn sẵn (nếu có)
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('.menu-item[data-auto-clear]').forEach(el=>el.remove());
  });
}catch{}

/* ===== Sticky Draggable Menu (giữ vị trí tới khi bạn di chuyển) ===== */
(function(){
  const sheet = document.getElementById('menuSheet');
  const card  = sheet?.querySelector('.menu-card');
  if(!sheet || !card) return;

  const KEY = 'fatx008:menuCardPos';

  function clamp(v,a,b){ return Math.min(b, Math.max(a, v)); }

  function restorePos(){
    try{
      const p = JSON.parse(localStorage.getItem(KEY) || 'null');
      if(p && Number.isFinite(p.x) && Number.isFinite(p.y)){
        card.style.left = p.x + 'px';
        card.style.top  = p.y + 'px';
      }
    }catch{}
    // đảm bảo còn nằm trong viewport
    snapIntoView();
  }

  function savePos(x, y){
    try{ localStorage.setItem(KEY, JSON.stringify({x,y})); }catch{}
  }

  function snapIntoView(){
    const vw = window.innerWidth, vh = window.innerHeight;
    const w = card.offsetWidth, h = card.offsetHeight;
    const x = clamp(card.offsetLeft, 8, vw - w - 8);
    const y = clamp(card.offsetTop , 8, vh - h - 8);
    card.style.left = x + 'px';
    card.style.top  = y + 'px';
  }

  // Kéo thả bằng Pointer Events
  let dragging = false, dx = 0, dy = 0;
  card.addEventListener('pointerdown', (e)=>{
    dragging = true;
    card.classList.add('dragging');
    dx = e.clientX - card.offsetLeft;
    dy = e.clientY - card.offsetTop;
    card.setPointerCapture?.(e.pointerId);
  });
  card.addEventListener('pointermove', (e)=>{
    if(!dragging) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const w = card.offsetWidth, h = card.offsetHeight;
    let x = e.clientX - dx, y = e.clientY - dy;
    x = clamp(x, 8, vw - w - 8);
    y = clamp(y, 8, vh - h - 8);
    card.style.left = x + 'px';
    card.style.top  = y + 'px';
  });
  card.addEventListener('pointerup', (e)=>{
    if(!dragging) return;
    dragging = false;
    card.classList.remove('dragging');
    savePos(card.offsetLeft, card.offsetTop);
  });

  // Khi mở menu: không reset, chỉ khôi phục vị trí đã lưu
  const origToggle = document.getElementById('homeFab');
  // Khi bấm HOME để mở/đóng menu, luôn đảm bảo vị trí còn hợp lệ
  sheet.addEventListener('transitionend', snapIntoView);
  // Khi window thay đổi kích thước, giữ menu trong khung nhìn
  window.addEventListener('resize', snapIntoView);

  // Khôi phục ngay khi trang sẵn sàng + mỗi lần mở menu
  (document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', restorePos)
    : restorePos());
  // Khi sheet mở, đảm bảo menu hiện đúng vị trí đã lưu
  const mo = new MutationObserver(()=>{ if(sheet.classList.contains('open')) restorePos(); });
  mo.observe(sheet, { attributes:true, attributeFilter:['class'] });
})();

(function(){
  const API_BASE = 'https://botkey.vshtechteam.workers.dev';
  const BRAND_TITLE = 'API SERVER KEY';
  const TZ = 'Asia/Ho_Chi_Minh';
  const ALWAYS_PROMPT = false;
  const LS = { DEVICE:'vsh_license_device', KEY:'vsh_license_key' };
  let deviceId = localStorage.getItem(LS.DEVICE);
  if(!deviceId){
    deviceId = (crypto.randomUUID?.() || (Date.now().toString(36)+Math.random().toString(36).slice(2,10))).toUpperCase();
    localStorage.setItem(LS.DEVICE, deviceId);
  }
  const fmt = (ts)=> ts==null ? 'lifetime' :
    new Intl.DateTimeFormat('vi-VN',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(ts);
  async function post(url, data){
    const r = await fetch(API_BASE+url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    return r.json().catch(()=>({ok:false,error:'PARSE_ERROR'}));
  }
  function ting(){
    try{
      const AC = new (window.AudioContext||window.webkitAudioContext)();
      const o=AC.createOscillator(), g=AC.createGain(), t=AC.currentTime;
      o.type='sine'; o.frequency.value=1200;
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(0.18,t+0.02);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.16);
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t+0.17);
    }catch{}
  }

  // CSS (scope trong #vgGate)
  const css = `
  #vgGate{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(8,10,15,.72);backdrop-filter:blur(6px)}
  #vgGate .vg-panel{width:min(620px,92vw);border:1px solid #2a2d3f;border-radius:16px;overflow:hidden;color:#e8e7ff;
    font-family:Inter,system-ui,Arial;background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.018));box-shadow:0 24px 60px rgba(0,0,0,.55)}
  #vgGate .vg-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid #2a2d3f}
  #vgGate .vg-brand{font-weight:900;letter-spacing:.3px;white-space:nowrap}
  #vgGate .vg-hd-rt{display:flex;gap:8px}
  #vgGate .vg-btn{padding:9px 14px;border-radius:10px;border:1px solid #3a3f56;background:#191f2a;color:#e8e7ff;cursor:pointer}
  #vgGate .vg-btn:hover{filter:brightness(1.08)}
  #vgGate .vg-btn--pri{background:#1e293b;border-color:#405075}
  #vgGate .vg-btn--ghost{background:#141924}
  #vgGate .vg-bd{padding:16px}
  #vgGate .vg-label{font-size:12px;color:#aab4d6;margin:0 0 6px 0}
  #vgGate .vg-field{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center}
  #vgGate .vg-input{padding:11px 12px;border-radius:10px;border:1px solid #3a3f56;background:#0c1017;color:#e8e7ff;width:100%}
  #vgGate .vg-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
  #vgGate .vg-msg{margin-top:12px;padding:12px;border-radius:12px;border:1px solid #2a2d3f;background:#0b1118;font-size:13px;line-height:1.45}
  #vgGate .vg-msg.ok{border-color:#2f9e44;background:#0d1a12;color:#b9ffd1}
  #vgGate .vg-msg.warn{border-color:#b8860b;background:#1b1607;color:#ffe9b0}
  #vgGate .vg-msg.err{border-color:#b02a37;background:#1a0f12;color:#ffd1d6}
  #vgGate .vg-foot{display:flex;justify-content:space-between;align-items:center;margin-top:10px;color:#9fb0d0;font-size:12px}
  #vgGate details{margin-top:10px;border:1px dashed #2a2d3f;border-radius:12px;overflow:hidden}
  #vgGate summary{padding:10px 12px;cursor:pointer;list-style:none;background:#0b0f15}
  #vgGate summary::-webkit-details-marker{display:none}
  #vgGate .vg-pre{margin:0;padding:12px 12px 14px;background:#0b0f15;color:#bcd;max-height:220px;overflow:auto}
  #vgGate .vg-icon{display:inline-flex;align-items:center;gap:6px;padding:9px 12px;border-radius:10px;border:1px solid #3a3f56;background:#151a24;cursor:pointer}
  #vgGate .vg-icon svg{width:16px;height:16px;display:block}
  @media (max-width:520px){
    #vgGate .vg-field{grid-template-columns:1fr}
    #vgGate .vg-hd{flex-wrap:wrap}
  }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // DOM
  function $(sel, root=document){ return root.querySelector(sel); }
  function build(){
    let wrap = $('#vgGate');
    if(wrap) return wrap;
    wrap = document.createElement('div');
    wrap.id = 'vgGate';
    wrap.innerHTML = `
      <div class="vg-panel">
        <div class="vg-hd">
          <div class="vg-brand">${BRAND_TITLE}</div>
          <div class="vg-hd-rt">
            <button class="vg-btn vg-btn--ghost" id="vgReset" title="Nhập lại">Nhập lại</button>
          </div>
        </div>

        <div class="vg-bd">
          <div>
            <div class="vg-label">Mã Kích Hoạt</div>
            <div class="vg-field">
              <input id="vgKey" class="vg-input" type="text" placeholder="FATX007-XXXX-XXXX-XXXX" autocomplete="one-time-code" inputmode="latin">
              <button class="vg-icon" id="vgPasteKey" title="Dán">
                <svg viewBox="0 0 24 24" fill="none"><path d="M8 4h8v4h4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4h4Z" stroke="currentColor" stroke-width="1.6"/><path d="M9 2h6v3a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V2Z" stroke="currentColor" stroke-width="1.6"/></svg>
                <span>Dán</span>
              </button>
              <button class="vg-icon" id="vgDelKey" title="Delete">
                <svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke="currentColor" stroke-width="1.6"/><path d="M10 11v7M14 11v7" stroke="currentColor" stroke-width="1.6"/></svg>
                <span>Delete</span>
              </button>
            </div>
          </div>

          <!-- Mục Mã Thiết Bị (hiển thị + sao chép) -->
          <div style="margin-top:12px">
            <div class="vg-label">Mã Thiết Bị</div>
            <div class="vg-field">
              <input id="vgDev" class="vg-input" type="text" readonly>
              <button class="vg-icon" id="vgCopyDev" title="Sao chép">
                <svg viewBox="0 0 24 24" fill="none"><path d="M9 9h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.6"/><path d="M7 15H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.6"/></svg>
                <span>Sao chép</span>
              </button>
            </div>
          </div>

          <div class="vg-actions">
            <button class="vg-btn vg-btn--pri" id="vgCheck">Kiểm tra</button>
            <button class="vg-btn vg-btn--pri" id="vgActive">Kích hoạt (1 thiết bị)</button>
          </div>

          <div class="vg-msg" id="vgMsg">Sẵn sàng.</div>
          <details id="vgDtl" hidden>
            <summary>Chi tiết kỹ thuật</summary>
            <pre class="vg-pre" id="vgRaw"></pre>
          </details>

          <div class="vg-foot">
            <span id="vgSta">Chưa kích hoạt</span>
            <span></span>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    // Prefill
    const lastKey = localStorage.getItem(LS.KEY)||'';
    if(lastKey) $('#vgKey').value = lastKey;
    $('#vgDev').value = deviceId;

    // Handlers
    $('#vgPasteKey').onclick = pasteIntoKey;
    $('#vgDelKey').onclick   = deleteKeyLocal;
    $('#vgCopyDev').onclick  = ()=> copyToClipboard($('#vgDev').value.trim(), 'Đã sao chép Mã Thiết Bị.');
    $('#vgReset').onclick    = ()=> { localStorage.removeItem(LS.KEY); updateStatus(null); show(); };
    $('#vgCheck').onclick    = onCheck;
    $('#vgActive').onclick   = onActivate;

    return wrap;
  }

  function setMsg(type, html, raw){
    const box = document.querySelector('#vgMsg'); box.className = 'vg-msg '+(type||''); box.innerHTML = html; ting();
    const dtl = document.querySelector('#vgDtl'); const pre = document.querySelector('#vgRaw');
    if(raw){ dtl.hidden=false; pre.textContent = typeof raw==='string'?raw:JSON.stringify(raw,null,2); }
    else { dtl.hidden=true; pre.textContent=''; }
  }
  function updateStatus(data){
    const el = document.querySelector('#vgSta'); if(!el) return;
    if(!data){ el.textContent = 'Chưa kích hoạt'; return; }
    el.textContent = `Hết hạn: ${fmt(data.expiresAt)}`;
  }
  function copyToClipboard(text, okText){ navigator.clipboard?.writeText(text).then(()=> setMsg('ok', okText) ); }

  async function pasteIntoKey(){
    const inp = document.querySelector('#vgKey');
    try{
      const txt = await navigator.clipboard.readText();
      inp.value = (txt||'').trim();
      setMsg('ok','Đã dán vào ô Mã Kích Hoạt.');
    }catch{
      const txt = prompt('Dán Mã Kích Hoạt tại đây:','')||'';
      inp.value = txt.trim();
      setMsg('ok','Đã dán vào ô Mã Kích Hoạt.');
    }
    inp.focus();
  }

  function deleteKeyLocal(){
    const inp = document.querySelector('#vgKey');
    inp.value = '';
    localStorage.removeItem(LS.KEY);
    updateStatus(null);
    setMsg('ok','Đã xoá Mã Kích Hoạt khỏi thiết bị này.');
  }

  async function onCheck(){
    const key = document.querySelector('#vgKey').value.trim();
    if(!key) return setMsg('warn','Vui lòng nhập Mã Kích Hoạt.');
    setMsg('', 'Đang kiểm tra…');
    const j = await post('/api/verify',{key});
    if(j.ok){
      localStorage.setItem(LS.KEY,key);
      const d = j.data;
      updateStatus(d);
      setMsg('ok', `✔️ Hợp lệ<br>Hết hạn: <b>${fmt(d.expiresAt)}</b>`, j);
    }else{
      const map={EXPIRED:'⏳ Mã đã hết hạn.',REVOKED:'🛑 Mã đã bị thu hồi.',NOT_FOUND:'❌ Không tìm thấy mã.'};
      setMsg('err', map[(j.error||'').toUpperCase()]||('❌ '+(j.error||'Lỗi')), j);
    }
  }

  async function onActivate(){
    const key = document.querySelector('#vgKey').value.trim();
    if(!key) return setMsg('warn','Vui lòng nhập Mã Kích Hoạt.');
    setMsg('', 'Đang kích hoạt…');
    const j = await post('/api/activate',{key, deviceId});
    if(j.ok){
      localStorage.setItem(LS.KEY,key);
      const d=j.data;
      updateStatus(d);
      setMsg('ok', `✅ Kích hoạt thành công<br>Hết hạn: <b>${fmt(d.expiresAt)}</b>`, j);
      setTimeout(()=>{ hide(); }, 1200);
      window.dispatchEvent(new CustomEvent('vsh-license-change',{detail:{state:'activated', data:d}}));
    }else{
      const why=(j.error||'').toUpperCase();
      const map={
        BOUND_TO_ANOTHER_DEVICE:'🔒 Mã đã gắn với thiết bị khác.',
        EXPIRED:'⏳ Mã đã hết hạn.',
        REVOKED:'🛑 Mã đã bị thu hồi.',
        NOT_FOUND:'❌ Không tìm thấy mã.'
      };
      setMsg('err', map[why] || ('❌ '+(j.error||'Lỗi')), j);
      window.dispatchEvent(new CustomEvent('vsh-license-change',{detail:{state:'invalid', data:j}}));
    }
  }

  function show(){ build(); document.getElementById('vgGate').style.display='grid'; }
  function hide(){ const g=document.getElementById('vgGate'); g && (g.style.display='none'); }

  // Guard on load
  async function guardOnLoad(){
    if(ALWAYS_PROMPT){ show(); return; }
    const savedKey = localStorage.getItem(LS.KEY);
    if(!savedKey){ show(); return; }
    const v = await post('/api/verify',{ key:savedKey });
    if(!v.ok){ show(); return; }
    if(!v.data.deviceId || v.data.deviceId !== deviceId){ show(); return; }
    updateStatus(v.data);
    document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible') guardOnLoad(); }, {once:true});
    setTimeout(()=>guardOnLoad(), 10*60*1000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', guardOnLoad);
  else guardOnLoad();

  window.VSHKeyGate = { show, hide, reset(){ localStorage.removeItem(LS.KEY); show(); } };
})();

/* ===== FATX007Loader (shapes-4, 10 giây, màu đồng bộ) ===== */
(function(){
  function mount(){
    if(document.getElementById('fatx007Shape4Loader')) return;
    const wrap=document.createElement('div'); wrap.id='fatx007Shape4Loader';
    wrap.innerHTML = `
      <div class="card">
        <div class="brand">Fatx007</div>
        <div class="shapes-4" aria-hidden="true"></div>
        <div class="sbar"><div class="sfill" id="fatx0074Fill"></div></div>
        <div id="fatx0074Pct" style="font-size:12px;color:#cfe2ff">0%</div>
      </div>`;
    document.body.appendChild(wrap);
  }
  function unmount(){
    const el=document.getElementById('fatx007Shape4Loader'); if(!el) return;
    el.classList.add('hide'); setTimeout(()=>el.remove(), 360);
  }

  const Loader = {
    _rAF:0,_t0:0,_dur:10000,_done:false,
    start(ms){
      this._dur = ms||10000; this._done=false; mount();
      const root=document.getElementById('fatx007Shape4Loader');
      const fill=document.getElementById('fatx0074Fill');
      const pct =document.getElementById('fatx0074Pct');
      this._t0 = performance.now();

      const ease = t => 1 - Math.pow(1 - t, 3); // easeOutCubic
      const hueStart = 210, hueEnd = 330;       // dải màu → bạn đổi tuỳ thích

      const step = ()=>{
        const t = (performance.now()-this._t0)/this._dur;
        const p = Math.min(100, ease(t)*100);

        // Cập nhật màu đồng bộ theo % (hue trượt từ hueStart→hueEnd)
        const H = Math.round(hueStart + (hueEnd - hueStart)*(p/100));
        if(root) root.style.setProperty('--h', H);

        if(fill) fill.style.width = p.toFixed(1)+'%';
        if(pct)  pct.textContent  = Math.floor(p)+'%';

        if(p<100 && !this._done) this._rAF = requestAnimationFrame(step);
        else this.done();
      };
      cancelAnimationFrame(this._rAF); step();
    },
    done(){
      if(this._done) return; this._done=true;
      try{ if(window.fatx007Ting) fatx007Ting(); }catch{}
      unmount();
    }
  };

  // Expose để dùng lại khi cần
  window.Fatx007Loader = Loader;

  // Auto chạy 10 giây khi vào trang
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', ()=>Loader.start(10000));
  }else{
    Loader.start(10000);
  }
})();


